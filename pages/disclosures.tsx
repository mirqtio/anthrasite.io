export default function Disclosuers() {
  return (
    <main style={{ backgroundColor: '#0A0A0A', color: 'white', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>How We Calculate Value</h1>
      <p> 
How do we put a dollar figure on your score?
 We start with publicly‑available business‑pattern data from the U.S. Census ZIP Business Patterns (2022) and BLS QCEW Employment & Wages (2024 Q3). Payroll is converted to revenue using ratios published in the BEA Bridging Tables, 2023 — typically 2.2× for small businesses. We then apply an evidence‑based digital‑conversion uplift (Google Chrome UX Report, 2023) showing that a 10‑point performance gain lifts online conversions by 9 %. Finally, we adjust for your industry’s average online‑revenue share (Adobe Digital Economy Index, 2024). The result is an annual revenue‑per‑point estimate unique to your ZIP and vertical.
</p>
    </main>
  );
}
