"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
async function run() {
    const threadId = 'test-thread-' + Date.now();
    const API_URL = 'http://localhost:3001/api';
    console.log('1. Sending Chat request to trigger getAstrologyChartTool...');
    try {
        const chatRes = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Here are my birth details: Location: Meerut, Date: 14/11/2005, Time: 01:15. What are my career prospects?',
                thread_id: threadId,
                user_name: "Yashasvi Solanki"
            })
        });
        const chatData = await chatRes.json();
        if (!chatRes.ok) {
            console.error('Chat error:', chatData);
            return;
        }
        console.log('Chat response successful. Preview:', chatData.reply.substring(0, 100) + '...');
    }
    catch (e) {
        console.error('Chat error:', e.message);
        return;
    }
    console.log('2. Requesting PDF report generation...');
    try {
        const res2 = await fetch(`${API_URL}/generate-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                thread_id: threadId,
                user_name: "Yashasvi Solanki"
            })
        });
        if (!res2.ok)
            throw new Error(await res2.text());
        const buffer = await res2.arrayBuffer();
        fs_1.default.writeFileSync('test_report.pdf', Buffer.from(buffer));
        console.log('PDF generation successful. Saved to test_report.pdf. Size in bytes:', buffer.byteLength);
    }
    catch (e) {
        console.error('PDF error:', e.message);
    }
}
run();
