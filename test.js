const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('PAUSE-Before-You-Prompt.html','utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true,
  beforeParse(window){
    window.html2pdf = () => ({ set(){return this;}, from(){return this;}, save(){window.__pdfSaved=true;} });
    window.print = ()=>{};
    window.open = ()=>({document:{write(){},close(){}},focus(){},print(){}});
  }
});
const w = dom.window, d = w.document;
const errs=[]; w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{ try {
  w.openPillarModal('privacy');
  w.answerTree('privacy', true);
  w.answerTree('privacy', false);
  console.log('privacy verdict:', w.getVerdict('privacy'));
  // reflection via app setters
  w.currentPromptIndex = 0;
  d.getElementById('journal-entry').value = 'My future self would approve.';
  w.saveJournalEntry();
  // scenario via app setter
  w.saveScenarioResponse(1,'motives','I want to actually learn to write.');
  w.saveScenarioResponse(1,'final','I will outline myself first.');
  d.getElementById('report-name').value = 'Jane Student';
  d.getElementById('report-course').value = 'WR 120';
  w.renderSynthesis();
  const matrix=d.getElementById('synthesis-matrix').innerHTML;
  console.log('matrix tiles:', (matrix.match(/rounded-2xl border-2/g)||[]).length);
  console.log('legend items:', (d.getElementById('synthesis-legend').innerHTML.match(/rounded-full/g)||[]).length);
  const rep=d.getElementById('report-content').innerHTML;
  console.log('Visual Synthesis Matrix:', rep.includes('Visual Synthesis Matrix'));
  console.log('colored cell #dc2626:', rep.includes('#dc2626'));
  console.log('Decision Paths:', rep.includes('Decision Paths'));
  console.log('Scenario Analyses:', rep.includes('Scenario Analyses'));
  console.log('Reflection Journal:', rep.includes('Reflection Journal'));
  console.log('name in report:', rep.includes('Jane Student'));
  console.log('reflection text in report:', rep.includes('future self would approve'));
  console.log('fns:', typeof w.exportPrint, typeof w.exportPDF, typeof w.copyReport);
  w.exportPDF(); console.log('pdf save called:', !!w.__pdfSaved);
  w.exportPrint(); console.log('print ran ok');
  console.log('JS errors:', errs.length?errs:'none');
} catch(e){ console.log('THREW:', e.message);} }, 500);
