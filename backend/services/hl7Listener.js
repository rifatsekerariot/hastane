const net = require('net');
const db = require('../config/db');

// MLLP Constants
const VT = String.fromCharCode(0x0b);
const FS = String.fromCharCode(0x1c);
const CR = String.fromCharCode(0x0d);

let ioInstance = null;

const start = (io) => {
    ioInstance = io;
    const port = process.env.HL7_PORT || 2575;

    const server = net.createServer((socket) => {
        console.log('HL7 Sender Connected: ' + socket.remoteAddress);
        let buffer = '';

        socket.on('data', (data) => {
            buffer += data.toString();

            // Allow processing multiple messages in one packet or split packets
            while (buffer.includes(FS + CR)) {
                const endIndex = buffer.indexOf(FS + CR);
                if (buffer.startsWith(VT)) {
                    const msg = buffer.substring(1, endIndex); // Remove VT
                    processMessage(msg);

                    // Send ACK
                    const ack = createAck(msg);
                    socket.write(VT + ack + FS + CR);
                }
                // Remove processed part from buffer (start to end + 2 chars)
                buffer = buffer.substring(endIndex + 2);
            }
        });

        socket.on('error', (err) => {
            console.error('HL7 Socket Error:', err);
        });
    });

    server.listen(port, () => {
        console.log(`HL7 Listener running on port ${port}`);
    });
};

const processMessage = async (msg) => {
    try {
        const segments = msg.split('\r').map(s => s.trim()).filter(s => s.length > 0);
        const segmentMap = {};

        segments.forEach(seg => {
            const fields = seg.split('|');
            const segParams = seg.split('|'); // Keep raw array
            segmentMap[fields[0]] = segParams;
        });

        if (!segmentMap['MSH']) { console.error("No MSH segment"); return; }

        const msh = segmentMap['MSH'];
        const messageType = msh[8] ? msh[8].split('^')[0] : 'UNKNOWN'; // ADT, ORU, etc.
        const triggerEvent = msh[8] && msh[8].split('^')[1] ? msh[8].split('^')[1] : ''; // A01, A03...

        console.log(`Processing ${messageType}^${triggerEvent}`);

        if (messageType === 'ADT') {
            await handleADT(segmentMap, triggerEvent);
        } else if (messageType === 'ORM' || messageType === 'ORU') {
            await handleOrder(segmentMap);
        }

    } catch (error) {
        console.error("Error processing HL7 message:", error);
    }
};

const handleADT = async (segments, trigger) => {
    // Extract PID
    const pid = segments['PID'];
    if (!pid) return;

    // PID-3: Patient ID List (ID^^^Type)
    const mrn = pid[3] ? pid[3].split('^')[0] : null;

    // PID-5: Name (Last^First)
    const pName = pid[5] ? pid[5].split('^') : [];
    const lastName = pName[0] || '';
    const firstName = pName[1] || '';

    // PV1-3: Assigned Patient Location (PointOfCare^Room^Bed)
    const pv1 = segments['PV1'];
    const location = pv1 && pv1[3] ? pv1[3].split('^') : [];
    const roomNumber = location[1]; // Assuming Room is 2nd component

    if (!roomNumber) {
        console.log("No room number found in PV1");
        return;
    }

    // Find Room ID
    const roomRes = await db.query('SELECT id FROM rooms WHERE room_number = $1', [roomNumber]);
    if (roomRes.rowCount === 0) {
        console.log(`Room ${roomNumber} not found in DB`);
        // Optionally create room auto? For now, skip.
        return;
    }
    const roomId = roomRes.rows[0].id;

    // Logic based on Trigger
    let status = 'Normal';
    if (trigger === 'A03') { // Discharge
        // Update DB: Remove patient from room or mark discharged
        // For simplicity: Update patient table with discharge date
        await db.query(`
            UPDATE patients SET current_status = 'Discharged', room_id = null, discharge_date = NOW()
            WHERE mrn = $1 AND current_status != 'Discharged'
        `, [mrn]);

        // Notify Room: Clear Screen or Show "Cleaning"
        // Let's assume discharge -> Cleaning
        status = 'Temizlik';

    } else { // A01 (Admit), A08 (Update)
        // Upsert Patient
        // Check if patient exists active
        const patRes = await db.query(`SELECT id FROM patients WHERE mrn = $1 AND current_status != 'Discharged'`, [mrn]);

        if (patRes.rowCount > 0) {
            // Update
            await db.query(`
                UPDATE patients SET 
                    room_id = $1, first_name = $2, last_name = $3, current_status = 'Normal', updated_at = NOW()
                WHERE id = $4
            `, [roomId, firstName, lastName, patRes.rows[0].id]);
        } else {
            // Insert
            await db.query(`
                INSERT INTO patients (mrn, first_name, last_name, room_id, admission_date, current_status)
                VALUES ($1, $2, $3, $4, NOW(), 'Normal')
            `, [mrn, firstName, lastName, roomId]);
        }
    }

    // Log to DB
    await db.query(`INSERT INTO hl7_logs (message_type, raw_message, processed_status) VALUES ($1, $2, 'SUCCESS')`,
        [`ADT^${trigger}`, 'Raw message content masked', 'SUCCESS']); // Avoid saving full PII raw

    // Emit Socket Event
    emitRoomUpdate(roomId, status, firstName, lastName);
};

const handleOrder = async (segments) => {
    // Logic for orders (e.g. Diet, Surgery)
    // Assuming OBR or ORC segments
    // Simple logic: Check for keywords in OBR-4 (Universal Service ID)
    // OBR|1|OrderControl|...|Code^Text|...

    // This is hypothetical. Need real mapping.
    // Let's look for "AMELIYAT" or "BEBEK" in OBR or DG1 (Diagnosis)
};

const emitRoomUpdate = (roomId, status, firstName, lastName) => {
    if (!ioInstance) return;

    // Private masking
    const mask = (str) => {
        if (!str || str.length < 2) return str;
        return str[0] + '**** ' + (str.length > 5 ? str[5] : ''); // Simplified masking
    };

    const maskedName = `${mask(firstName)} ${mask(lastName)}`;

    const payload = {
        status: status, // Normal, Temizlik, Ameliyatta
        patientName: maskedName,
        // Add doctor info if available
    };

    ioInstance.to(roomId).emit('room_update', payload);
    console.log(`Emitted update to room ${roomId}: ${status}`);
};

const createAck = (originalMsg) => {
    // Simple ACK generation
    // MSH|^~\&|...
    // MSA|AA|ControlID
    const segments = originalMsg.split('\r');
    const msh = segments[0].split('|');
    const controlId = msh[9];

    return `MSH|^~\\&|HOSP_APP|HOSPITAL|HBYS|SENDER|${getDate()}|ACK^A01|${controlId}|P|2.3\rMSA|AA|${controlId}\r`;
};

const getDate = () => {
    const d = new Date();
    return d.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
};

module.exports = { start };
