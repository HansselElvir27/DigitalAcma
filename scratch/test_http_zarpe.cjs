const http = require('http');

async function testCreateZarpe() {
    const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    
    // We need to fetch the port first to get a valid port name
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
        const port = await prisma.port.findFirst();
        if (!port) {
            console.log("No ports found in DB to test");
            return;
        }

        const payload = {
            name: "Test Captain",
            email: "test@example.com",
            vesselName: "Test Vessel",
            registrationNum: "REG-1234",
            portName: port.name,
            destination: "Roatan",
            departureDate: new Date().toISOString().split('T')[0],
            departureTime: "12:00",
            signature: dummyBase64,
            crewListFile: dummyBase64
        };

        const response = await fetch('http://localhost:3000/api/public/zarpes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(data, null, 2));

        if (data.request) {
            console.log("Saved Signature Path in DB:", data.request.signature);
            console.log("Saved CrewList Path in DB:", data.request.crewListFile);
            
            // Now let's try to fetch that file!
            if (data.request.signature && data.request.signature.startsWith('/api')) {
                const fileRes = await fetch(`http://localhost:3000${data.request.signature}`);
                console.log("Fetch File Status:", fileRes.status);
                console.log("Fetch File Headers:", [...fileRes.headers.entries()]);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

testCreateZarpe();
