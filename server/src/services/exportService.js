import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { ensureStorageDirs, exportDir, resolvePublicFilePath } from '../config/storage.js';

ensureStorageDirs();

/**
 * Generate a PDF Design Proposal for a room.
 * Includes original photo, redesigns, room details, and furniture list.
 */
export async function generateDesignProposalPDF(room, redesigns, layout) {
    const filename = `proposal_${room.id.slice(0, 8)}_${Date.now()}.pdf`;
    const filePath = path.join(exportDir, filename);

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            info: {
                Title: `Design Proposal - ${room.title}`,
                Author: 'DreamSpace AI',
                Subject: 'Room Design Proposal',
            },
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        const olive = '#6B7F5E';
        const dark = '#1A1714';
        const charcoal = '#3D3831';
        const cream = '#FAF6F0';
        const beige = '#E8DFD1';
        const gold = '#C8A96E';

        // ── Header ──
        doc.rect(0, 0, doc.page.width, 120).fill(olive);
        doc.fillColor('#FFFFFF').fontSize(28).font('Helvetica-Bold')
           .text('DreamSpace AI', 50, 40, { align: 'left' });
        doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica')
           .text('Design Proposal', 50, 75);

        // Date
        doc.fillColor('rgba(255,255,255,0.8)').fontSize(9).font('Helvetica')
           .text(`Generated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, 400, 75);

        doc.moveDown(5);

        // ── Room Details ──
        doc.fillColor(dark).fontSize(20).font('Helvetica-Bold')
           .text(room.title || 'Untitled Room');
        doc.moveDown(0.3);
        doc.fillColor(charcoal).fontSize(11).font('Helvetica')
           .text(`Room Type: ${room.roomType?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Living Room'}`)
           .text(`Total Redesigns: ${redesigns?.length || 0}`)
           .text(`Total Layouts: ${layout ? '1' : '0'}`);

        doc.moveDown(1);

        // Divider
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(beige).lineWidth(1).stroke();
        doc.moveDown(1.5);

        // ── Original Room ──
        doc.fillColor(dark).fontSize(16).font('Helvetica-Bold').text('Original Room');
        doc.moveDown(0.8);

        const originalImgPath = resolvePublicFilePath(room.originalImageUrl);
        if (fs.existsSync(originalImgPath)) {
            doc.image(originalImgPath, 50, doc.y, { width: 240, height: 160, fit: 'cover' });
        } else {
            doc.fillColor(charcoal).fontSize(10).text('[ Original image not available locally ]', 50, doc.y);
        }

        doc.moveDown(4);

        // ── Redesigns ──
        if (redesigns && redesigns.length > 0) {
            doc.fillColor(dark).fontSize(16).font('Helvetica-Bold').text('AI Redesigns');
            doc.moveDown(0.8);

            const stylesToShow = redesigns.slice(0, 4);
            for (const redesign of stylesToShow) {
                if (doc.y > 550) doc.addPage();

                // Style name
                const styleName = redesign.style?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Modern';
                doc.fillColor(olive).fontSize(12).font('Helvetica-Bold').text(styleName);
                
                if (redesign.method) {
                    doc.fillColor(charcoal).fontSize(8).font('Helvetica')
                       .text(`Method: ${redesign.method}`, { continued: false });
                }
                doc.moveDown(0.3);

                const imgPath = resolvePublicFilePath(redesign.imageUrl);
                if (fs.existsSync(imgPath)) {
                    try {
                        doc.image(imgPath, 50, doc.y, { width: 200, height: 133, fit: 'cover' });
                    } catch (e) {
                        doc.fillColor(charcoal).fontSize(9).text('[ Image not available ]');
                    }
                }
                doc.moveDown(3);
            }

            if (redesigns.length > 4) {
                doc.fillColor(charcoal).fontSize(9).font('Helvetica')
                   .text(`... and ${redesigns.length - 4} more redesigns available in the app.`);
                doc.moveDown(1);
            }
        } else {
            doc.fillColor(charcoal).fontSize(10).font('Helvetica')
               .text('No redesigns generated yet. Open the room in DreamSpace AI to create AI-powered designs.');
            doc.moveDown(1);
        }

        // ── Layout Summary ──
        if (layout) {
            if (doc.y > 500) doc.addPage();

            doc.moveDown(1);
            doc.fillColor(dark).fontSize(16).font('Helvetica-Bold').text('3D Layout Summary');
            doc.moveDown(0.8);

            try {
                const layoutData = JSON.parse(typeof layout === 'string' ? layout : JSON.stringify(layout));
                const items = Array.isArray(layoutData) ? layoutData : [];

                if (items.length > 0) {
                    // Table header
                    const tableTop = doc.y;
                    doc.fillColor(olive).fontSize(9).font('Helvetica-Bold');
                    doc.text('Item', 50, tableTop, { width: 180 });
                    doc.text('Type', 240, tableTop, { width: 100 });
                    doc.text('Material', 350, tableTop, { width: 100 });
                    doc.text('Color', 460, tableTop, { width: 80 });
                    
                    doc.moveTo(50, doc.y + 4).lineTo(545, doc.y + 4).strokeColor(beige).lineWidth(0.5).stroke();
                    doc.moveDown(0.8);

                    const uniqueItems = items.filter((item, idx, arr) => 
                        arr.findIndex(i => i.type === item.type) === idx
                    ).slice(0, 15);

                    for (const item of uniqueItems) {
                        if (doc.y > 700) doc.addPage();
                        doc.fillColor(charcoal).fontSize(9).font('Helvetica');
                        doc.text(item.name || item.type, 50, doc.y, { width: 180 });
                        doc.text(item.type || '-', 240, doc.y, { width: 100 });
                        doc.text(item.material || '-', 350, doc.y, { width: 100 });
                        doc.text(item.color || '-', 460, doc.y, { width: 80 });
                        doc.moveDown(0.4);
                    }

                    doc.moveDown(0.5);
                    doc.fillColor(charcoal).fontSize(9).font('Helvetica')
                       .text(`Total furniture items: ${items.length}`);
                }
            } catch (e) {
                doc.fillColor(charcoal).fontSize(9).text('Layout data available in the app.');
            }
        }

        // ── Footer ──
        if (doc.y > 680) doc.addPage();

        doc.moveDown(2);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(beige).lineWidth(1).stroke();
        doc.moveDown(1);

        doc.fillColor(charcoal).fontSize(9).font('Helvetica')
           .text('Generated by DreamSpace AI — AI-Powered Interior Design Platform', 50, doc.y, { align: 'center' })
           .text('https://dreamspace-ai.loca.lt', { align: 'center' });

        doc.end();

        stream.on('finish', () => {
            resolve({ filename, filePath, url: `/exports/${filename}` });
        });
        stream.on('error', reject);
    });
}
