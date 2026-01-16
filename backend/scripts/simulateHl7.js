const net = require('net');

const HOST = 'localhost';
const PORT = 2575;

// MLLP Wrappers
const VT = String.fromCharCode(0x0b);
const FS = String.fromCharCode(0x1c);
const CR = String.fromCharCode(0x0d);

const createADTMessage = (trigger, messageId, patientName, room) => {
    const time = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);

    // MSH Segment
    let msg = `MSH|^~\\&|SIMULATOR|HOSPITAL|HBYS|APP|${time}||ADT^${trigger}|${messageId}|P|2.3\r`;

    // EVN Segment
    msg += `EVN|${trigger}|${time}\r`;

    // PID Segment (Patient Info)
    // PID|ID|ExtID|IntID|AltID|Name(Last^First)|...
    msg += `PID|1||123456^^^HOSP||${patientName}||19800101|M\r`;

    // PV1 Segment (Visit Info)
    // PV1|SetID|PatientClass|Location(PoC^Room^Bed)|...
    msg += `PV1|1|I|Service^${room}^1||||123^Doktor^Strange\r`;

    return VT + msg + FS + CR;
};

const client = new net.Socket();

client.connect(PORT, HOST, () => {
    console.log(`Connected to HL7 Server at ${HOST}:${PORT}`);

    // Scenario 1: Admit Patient "Ahmet Yilmaz" to Room 101
    const msg1 = createADTMessage('A01', 'MSG001', 'Yilmaz^Ahmet', '101');
    console.log('Sending Admission (Normal)...');
    client.write(msg1);

    setTimeout(() => {
        // Scenario 2: Baby Born trigger (Custom, using A08 or similar, logic depends on backend mapper)
        // For this demo, let's assume we send an update that triggers "Bebek" logic
        // But our backend logic in hl7Listener.js was simple admission. 
        // Let's rely on the listener logic: it maps trigger A03 to Discharge (Temizlik).

        // Let's send a Discharge
        const msg2 = createADTMessage('A03', 'MSG002', 'Yilmaz^Ahmet', '101');
        console.log('Sending Discharge (Cleaning)...');
        client.write(msg2);

        // Close after a bit
        setTimeout(() => {
            client.destroy();
        }, 1000);

    }, 5000); // Wait 5 seconds between messages
});

client.on('data', (data) => {
    console.log('Received ACK:', data.toString());
});

client.on('close', () => {
    console.log('Connection closed');
});
