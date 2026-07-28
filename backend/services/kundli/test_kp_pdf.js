"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdfService_1 = require("./pdfService");
const fs_1 = __importDefault(require("fs"));
async function run() {
    const rawData = fs_1.default.readFileSync('chart_xg0ei.json', 'utf-8');
    const chartData = JSON.parse(rawData);
    // Provide some dummy values to test KP Cusps
    const pdfBuffer = await (0, pdfService_1.compileAstrologyPdf)(chartData, "10:30", "15/08/1990", "Tejas");
    fs_1.default.writeFileSync('kp_test_render.pdf', pdfBuffer);
    console.log('kp_test_render.pdf created successfully');
}
run();
