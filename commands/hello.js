async function helloCommand(sock, from, msg) {
    await sock.sendMessage(from, { text: "Hello there! How can I help you today?" }, { quoted: msg });
}

module.exports = helloCommand;
