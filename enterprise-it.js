/* ══════════════════════════════════════════════
   Enterprise IT Infrastructure — Interactions
   ══════════════════════════════════════════════ */

// ── SCROLL PROGRESS BAR ──────────────────────
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  document.getElementById('progressBar').style.width = (scrolled / total * 100) + '%';
});

// ── SCROLL REVEAL ────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── COST BAR ANIMATIONS ──────────────────────
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.cost-bar-fill').forEach(bar => {
        setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 200);
      });
      barObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.cost-category').forEach(el => barObserver.observe(el));

// ══════════════════════════════════════════════
// LAN DIAGRAM
// ══════════════════════════════════════════════
function buildLanDiagram() {
  const container = document.getElementById('lanDiagram');
  if (!container) return;

  const nodes = [
    { id: 'pc1', x: 60,  y: 280, label: 'Workstation', sub: '192.168.1.10', tip: 'End-user workstation running Windows 11. Communicates via Ethernet to the access switch.' },
    { id: 'pc2', x: 180, y: 280, label: 'Workstation', sub: '192.168.1.11', tip: 'Second workstation. All devices in a subnet share the same broadcast domain.' },
    { id: 'pr',  x: 300, y: 280, label: 'Printer',     sub: '192.168.1.20', tip: 'Network printer with static IP. Shared via print server or direct IP printing.' },
    { id: 'sv',  x: 420, y: 280, label: 'File Server',  sub: '192.168.1.5',  tip: 'On-premise file server. Hosts shared drives accessible to all LAN devices.' },
    { id: 'ip',  x: 540, y: 280, label: 'IP Camera',   sub: '192.168.1.30', tip: 'PoE security camera on a dedicated VLAN for network segmentation.' },
    { id: 'sw',  x: 300, y: 170, label: 'Core Switch', sub: 'Layer 2 / VLAN', tip: 'Managed enterprise switch (e.g. Cisco Catalyst). Handles VLANs, STP, and LACP. Switches frames at ~wire speed.' },
    { id: 'rt',  x: 300, y: 70,  label: 'Router',      sub: 'Gateway · 192.168.1.1', tip: 'Layer 3 router. Routes between subnets and provides the gateway to the internet via the ISP uplink.' },
    { id: 'fw',  x: 490, y: 70,  label: 'Firewall',    sub: 'Palo Alto / pfSense', tip: 'Stateful firewall inspecting all traffic leaving and entering the LAN. Enforces access control lists.' },
    { id: 'isp', x: 490, y: 170, label: 'ISP Uplink',  sub: 'WAN / Internet', tip: 'The connection to the Internet Service Provider. Typically fiber at 1Gbps–10Gbps for enterprise.' },
  ];

  const edges = [
    { from: 'pc1', to: 'sw', dashed: false },
    { from: 'pc2', to: 'sw', dashed: false },
    { from: 'pr',  to: 'sw', dashed: false },
    { from: 'sv',  to: 'sw', dashed: false },
    { from: 'ip',  to: 'sw', dashed: false },
    { from: 'sw',  to: 'rt', dashed: true, flow: true },
    { from: 'rt',  to: 'fw', dashed: true, flow: true },
    { from: 'fw',  to: 'isp', dashed: true, flow: true },
  ];

  const pos = {};
  nodes.forEach(n => { pos[n.id] = { x: n.x, y: n.y }; });

  let edgeSvg = '';
  edges.forEach((e, i) => {
    const p1 = pos[e.from], p2 = pos[e.to];
    const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const color = e.flow ? '#0066cc' : '#cccccc';
    const dash = e.dashed ? 'stroke-dasharray="6,4"' : '';
    const cls = e.flow ? 'data-flow' : '';
    edgeSvg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${e.flow ? 1.5 : 1}" ${dash} class="${cls}" />`;
    if (e.flow) {
      // animated dot
      edgeSvg += `<circle r="3" fill="#0066cc" opacity="0.8">
        <animateMotion dur="${1.5 + i * 0.3}s" repeatCount="indefinite" begin="${i * 0.4}s">
          <mpath href="#path_${i}"/>
        </animateMotion>
      </circle>
      <path id="path_${i}" d="M${p1.x},${p1.y} L${p2.x},${p2.y}" fill="none" visibility="hidden"/>`;
    }
  });

  let nodeSvg = '';
  nodes.forEach(n => {
    const isSwitch = n.id === 'sw' || n.id === 'rt' || n.id === 'fw' || n.id === 'isp';
    const w = 90, h = 40;
    const fill = (n.id === 'sw' || n.id === 'rt') ? '#f5f5f7' : '#ffffff';
    const stroke = (n.id === 'sw') ? '#0066cc' : '#e0e0e0';
    const strokeW = (n.id === 'sw') ? 1.5 : 1;
    nodeSvg += `
      <g class="node-hover lan-node" data-id="${n.id}" data-tip="${n.tip}" style="cursor:pointer;">
        <rect class="node-bg" x="${n.x - w/2}" y="${n.y - h/2}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}"/>
        <text x="${n.x}" y="${n.y - 4}" text-anchor="middle" font-size="10" font-weight="600" font-family="system-ui" fill="#1d1d1f">${n.label}</text>
        <text x="${n.x}" y="${n.y + 10}" text-anchor="middle" font-size="9" font-family="monospace" fill="#7a7a7a">${n.sub}</text>
      </g>`;
  });

  container.innerHTML = `
    <svg viewBox="0 30 620 310" fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;">
      <defs>
        <style>.data-flow{animation: dashFlow 1.2s linear infinite;}</style>
      </defs>
      ${edgeSvg}
      ${nodeSvg}
    </svg>`;

  // Tooltip
  const tooltip = document.getElementById('lanTooltip');
  container.querySelectorAll('.lan-node').forEach(node => {
    node.addEventListener('mouseenter', (e) => {
      tooltip.textContent = node.dataset.tip;
      tooltip.classList.add('visible');
    });
    node.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
      tooltip.style.top  = (e.clientY - rect.top  - 12) + 'px';
    });
    node.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
  });
}

// ══════════════════════════════════════════════
// SERVER EXPLODED VIEW
// ══════════════════════════════════════════════
const serverComponents = {
  cpu:  { title: 'CPU — Dual-Socket Processor', body: 'Enterprise servers use dual or quad-socket configurations with server-grade CPUs (Intel Xeon, AMD EPYC). A single Xeon Platinum may have 32 cores and 64 threads. CPUs communicate via high-speed interconnects (QPI/UPI).' },
  ram:  { title: 'RAM — ECC Registered Memory', body: 'Error-Correcting Code (ECC) RAM detects and corrects single-bit errors automatically — critical for data integrity in servers. A typical rack server holds 256GB–3TB of DDR5 RAM across 32 DIMM slots.' },
  nic:  { title: 'NIC — Dual-Port 10GbE', body: 'Enterprise NICs have dual 10Gbps or 25Gbps ports for redundancy via NIC teaming (LACP). Some servers use InfiniBand at 200Gbps for high-performance computing or storage arrays.' },
  stor: { title: 'Storage — NVMe + SATA Array', body: 'Hot-swap bays hold NVMe SSDs for low latency or SATA/SAS HDDs for capacity. A hardware RAID controller (e.g. Dell PERC) provides RAID 5/6/10 for redundancy without performance penalty.' },
  psu:  { title: 'PSU — Redundant Hot-Swap', body: 'Enterprise servers ship with dual hot-swap PSUs in N+1 configuration. If one fails, the other carries the load with zero downtime. PSUs typically operate at 80 PLUS Platinum efficiency (>92%).' },
  mb:   { title: 'Motherboard — Server Platform', body: 'A server motherboard (e.g. Intel S2600 platform) has multiple PCIe 5.0 slots for expansion cards, dual CPU sockets, and integrated BMC/iDRAC management for out-of-band control without booting the OS.' },
  bmc:  { title: 'BMC — Baseboard Management Controller', body: 'The BMC is a dedicated microcontroller that monitors hardware health (temps, voltages, fan speeds) and allows remote management. Tools like iDRAC (Dell) or iLO (HPE) let admins reboot or reimage a server remotely.' },
};

function buildServerDiagram() {
  const container = document.getElementById('serverDiagram');
  const card = document.getElementById('serverInfoCard');
  const closeBtn = document.getElementById('closeCard');
  if (!container) return;

  // Chassis dimensions
  const cw = 320, ch = 200, cx = 190, cy = 40;

  const parts = [
    { id: 'mb',   x: cx+10,  y: cy+10,  w: cw-20,  h: ch-20,  fill: '#2a2a2c', label: 'Motherboard', lx: cx-100, ly: cy+ch-30, side: 'left' },
    { id: 'cpu',  x: cx+30,  y: cy+30,  w: 70,     h: 50,     fill: '#3a3a3c', label: 'CPU',         lx: cx-100, ly: cy+55,    side: 'left' },
    { id: 'ram',  x: cx+120, y: cy+30,  w: 30,     h: 90,     fill: '#0066cc', label: 'RAM (×8)',     lx: cx+cw+20, ly: cy+75,  side: 'right' },
    { id: 'nic',  x: cx+30,  y: cy+100, w: 60,     h: 30,     fill: '#3a3a3c', label: 'NIC',         lx: cx-100, ly: cy+115,   side: 'left' },
    { id: 'stor', x: cx+170, y: cy+30,  w: 100,    h: 55,     fill: '#272729', label: 'Storage',      lx: cx+cw+20, ly: cy+55,  side: 'right' },
    { id: 'psu',  x: cx+170, y: cy+105, w: 100,    h: 65,     fill: '#1d1d1f', label: 'PSU ×2',       lx: cx+cw+20, ly: cy+130, side: 'right' },
    { id: 'bmc',  x: cx+30,  y: cy+150, w: 50,     h: 20,     fill: '#272729', label: 'BMC',          lx: cx-100, ly: cy+160,   side: 'left' },
  ];

  let partsSvg = '';
  parts.forEach(p => {
    const compX = p.x + p.w / 2, compY = p.y + p.h / 2;
    const lX = p.lx + (p.side === 'left' ? 80 : 0), lY = p.ly;
    partsSvg += `
      <g class="server-part" data-id="${p.id}" style="cursor:pointer;">
        <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="3" fill="${p.fill}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
        <text x="${compX}" y="${compY + 4}" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.6)" font-family="system-ui" font-weight="600">${p.label}</text>
        <line x1="${compX}" y1="${compY}" x2="${p.lx + (p.side === 'left' ? 82 : -2)}" y2="${lY}" stroke="rgba(255,255,255,0.2)" stroke-width="0.75" stroke-dasharray="3,2"/>
        <rect x="${p.lx}" y="${lY - 12}" width="80" height="22" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="1" class="label-btn"/>
        <text x="${p.lx + 40}" y="${lY + 3}" text-anchor="middle" font-size="10" fill="#2997ff" font-family="system-ui" font-weight="600" class="label-text">${p.label}</text>
      </g>`;
  });

  // Rack chassis
  const rackSvg = `
    <rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="4" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>
    <rect x="${cx}" y="${cy}" width="${cw}" height="12" rx="0" fill="rgba(255,255,255,0.04)"/>
    <rect x="${cx+cw-30}" y="${cy+2}" width="8" height="8" rx="2" fill="#00cc66" opacity="0.8"/>
    <rect x="${cx+cw-20}" y="${cy+2}" width="8" height="8" rx="2" fill="#cc8800" opacity="0.6"/>
    <text x="${cx+8}" y="${cy+9}" font-size="7" fill="rgba(255,255,255,0.3)" font-family="monospace">1U RACK SERVER</text>`;

  container.innerHTML = `
    <svg viewBox="0 0 700 280" fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow:visible; max-height: 480px;">
      ${rackSvg}
      ${partsSvg}
    </svg>`;

  // Click interaction
  container.querySelectorAll('.server-part').forEach(part => {
    part.addEventListener('click', (e) => {
      const info = serverComponents[part.dataset.id];
      if (!info) return;
      document.getElementById('cardTitle').textContent = info.title;
      document.getElementById('cardBody').textContent = info.body;
      // Position card near click
      const rect = container.getBoundingClientRect();
      const svgRect = container.querySelector('svg').getBoundingClientRect();
      card.style.top = (e.clientY - svgRect.top + 12) + 'px';
      card.style.left = Math.min(e.clientX - svgRect.left + 12, svgRect.width - 280) + 'px';
      card.classList.add('active');
    });
  });

  closeBtn.addEventListener('click', () => card.classList.remove('active'));
  document.addEventListener('click', (e) => {
    if (!card.contains(e.target) && !e.target.closest('.server-part')) {
      card.classList.remove('active');
    }
  });
}

// ══════════════════════════════════════════════
// RACK DIAGRAM (Server Room)
// ══════════════════════════════════════════════
function buildRackDiagram() {
  const container = document.getElementById('rackDiagram');
  if (!container) return;

  const slots = [
    { label: 'Patch Panel', fill: '#f5f5f7', text: '#7a7a7a' },
    { label: '1U Server', fill: '#1d1d1f', text: '#fff', accent: true },
    { label: '1U Server', fill: '#1d1d1f', text: '#fff', accent: true },
    { label: '2U Server', fill: '#272729', text: '#fff', tall: true },
    { label: 'KVM Switch', fill: '#f5f5f7', text: '#7a7a7a' },
    { label: 'Blank Panel', fill: '#e8e8ea', text: '#ccc' },
    { label: '1U Server', fill: '#1d1d1f', text: '#fff', accent: true },
    { label: 'Network Switch', fill: '#003399', text: '#fff' },
    { label: 'Blank Panel', fill: '#e8e8ea', text: '#ccc' },
    { label: 'UPS Unit', fill: '#272729', text: '#fff', tall: true },
    { label: 'PDU Strip', fill: '#333', text: '#aaa' },
  ];

  let y = 30, slotsSvg = '';
  slots.forEach((slot, i) => {
    const h = slot.tall ? 36 : 18;
    slotsSvg += `
      <rect x="36" y="${y}" width="200" height="${h}" rx="2" fill="${slot.fill}" stroke="${slot.accent ? '#0066cc' : 'rgba(0,0,0,0.08)'}" stroke-width="${slot.accent ? 1 : 0.5}"/>
      <text x="46" y="${y + h/2 + 4}" font-size="9" font-family="system-ui" fill="${slot.text}" font-weight="${slot.accent ? '600' : '400'}">${slot.label}</text>
      ${slot.accent ? `<circle cx="226" cy="${y + h/2}" r="3" fill="#00cc66" opacity="0.8"/>` : ''}
      <text x="18" y="${y + h/2 + 4}" font-size="8" font-family="monospace" fill="#ccc" text-anchor="middle">${i + 1}U</text>`;
    y += h + 2;
  });

  container.innerHTML = `
    <svg viewBox="0 0 280 ${y + 30}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Rack chassis -->
      <rect x="8" y="10" width="260" height="${y + 10}" rx="4" fill="#f0f0f2" stroke="#d2d2d7" stroke-width="1"/>
      <rect x="8" y="10" width="260" height="20" rx="4" fill="#e0e0e4"/>
      <text x="138" y="24" text-anchor="middle" font-size="9" font-family="system-ui" font-weight="600" fill="#7a7a7a" letter-spacing="0.08em">42U SERVER RACK</text>
      ${slotsSvg}
      <!-- Rails -->
      <rect x="8" y="10" width="8" height="${y + 10}" rx="2" fill="#d2d2d7"/>
      <rect x="260" y="10" width="8" height="${y + 10}" rx="2" fill="#d2d2d7"/>
    </svg>`;
}

// ══════════════════════════════════════════════
// ENTERPRISE SYSTEMS DIAGRAM
// ══════════════════════════════════════════════
function buildEnterpriseDiagram() {
  const container = document.getElementById('enterpriseDiagram');
  if (!container) return;

  const layers = [
    { label: 'Internet / WAN', y: 20,  color: '#3a3a3c', textColor: '#999' },
    { label: 'Perimeter Firewall', y: 70, color: '#003399', textColor: '#2997ff', note: 'Palo Alto / pfSense' },
    { label: 'DMZ — Public Services', y: 120, color: '#2a2a2c', textColor: '#ccc', note: 'Web servers, email relay' },
    { label: 'Core Network (VLANs)', y: 170, color: '#272729', textColor: '#ccc', note: 'VLAN 10 Users · VLAN 20 Servers · VLAN 30 Cameras' },
    { label: 'Server Infrastructure', y: 220, color: '#1d1d1f', textColor: '#fff', note: 'Hyper-V / VMware ESXi cluster' },
    { label: 'Active Directory · DNS · DHCP', y: 270, color: '#0055bb', textColor: '#fff', note: 'Domain Controller' },
    { label: 'SQL Server · File Server · Print', y: 320, color: '#004499', textColor: '#fff', note: 'Business applications & data' },
  ];

  let layerSvg = '';
  layers.forEach((l, i) => {
    layerSvg += `
      <rect x="40" y="${l.y}" width="760" height="38" rx="5" fill="${l.color}"/>
      <text x="60" y="${l.y + 24}" font-size="13" font-weight="600" font-family="system-ui" fill="${l.textColor}">${l.label}</text>
      ${l.note ? `<text x="760" y="${l.y + 24}" font-size="11" font-family="system-ui" fill="rgba(255,255,255,0.3)" text-anchor="end">${l.note}</text>` : ''}`;
    if (i < layers.length - 1) {
      layerSvg += `
        <line x1="420" y1="${l.y + 38}" x2="420" y2="${l.y + 50}" stroke="#0066cc" stroke-width="1.5" stroke-dasharray="4,3" class="data-flow"/>
        <polygon points="415,${l.y + 50} 425,${l.y + 50} 420,${l.y + 58}" fill="#0066cc" opacity="0.7"/>`;
    }
  });

  container.innerHTML = `
    <svg viewBox="0 0 840 375" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%; overflow:visible;">
      <defs><style>.data-flow{animation:dashFlow 1s linear infinite;}</style></defs>
      ${layerSvg}
    </svg>`;
}

// ══════════════════════════════════════════════
// CLOUD CONNECTIVITY DIAGRAM
// ══════════════════════════════════════════════
function buildCloudDiagram() {
  const container = document.getElementById('cloudDiagram');
  if (!container) return;

  container.innerHTML = `
    <svg viewBox="0 0 800 160" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%; margin-top:8px;">
      <!-- On-Prem DC -->
      <rect x="20" y="40" width="140" height="80" rx="8" fill="#f5f5f7" stroke="#e0e0e0" stroke-width="1"/>
      <text x="90" y="72" text-anchor="middle" font-size="11" font-weight="600" font-family="system-ui" fill="#1d1d1f">On-Premise DC</text>
      <text x="90" y="88" text-anchor="middle" font-size="9" font-family="system-ui" fill="#7a7a7a">VMs · AD · SQL</text>
      <text x="90" y="104" text-anchor="middle" font-size="9" font-family="system-ui" fill="#7a7a7a">Local backup</text>

      <!-- VPN tunnel -->
      <line x1="160" y1="80" x2="310" y2="80" stroke="#0066cc" stroke-width="1.5" stroke-dasharray="6,4" class="data-flow"/>
      <text x="235" y="70" text-anchor="middle" font-size="9" font-family="system-ui" fill="#0066cc">VPN / ExpressRoute</text>

      <!-- Azure / Hybrid Hub -->
      <rect x="310" y="20" width="180" height="120" rx="8" fill="#ffffff" stroke="#0066cc" stroke-width="1.5"/>
      <text x="400" y="52" text-anchor="middle" font-size="11" font-weight="600" font-family="system-ui" fill="#0066cc">Azure Hybrid Hub</text>
      <text x="400" y="72" text-anchor="middle" font-size="9" font-family="system-ui" fill="#7a7a7a">Azure AD Connect</text>
      <text x="400" y="88" text-anchor="middle" font-size="9" font-family="system-ui" fill="#7a7a7a">Azure Backup</text>
      <text x="400" y="104" text-anchor="middle" font-size="9" font-family="system-ui" fill="#7a7a7a">Blob Storage</text>
      <text x="400" y="120" text-anchor="middle" font-size="9" font-family="system-ui" fill="#7a7a7a">Azure Monitor</text>

      <!-- To AWS -->
      <line x1="490" y1="60" x2="620" y2="48" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="4,3"/>
      <!-- To GCP -->
      <line x1="490" y1="100" x2="620" y2="112" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="4,3"/>

      <!-- AWS box -->
      <rect x="620" y="20" width="150" height="52" rx="6" fill="#f5f5f7" stroke="#e0e0e0" stroke-width="1"/>
      <text x="695" y="44" text-anchor="middle" font-size="11" font-weight="600" font-family="system-ui" fill="#1d1d1f">AWS (multi-cloud)</text>
      <text x="695" y="60" text-anchor="middle" font-size="9" font-family="system-ui" fill="#7a7a7a">S3 · RDS · CloudFront</text>

      <!-- GCP box -->
      <rect x="620" y="88" width="150" height="52" rx="6" fill="#f5f5f7" stroke="#e0e0e0" stroke-width="1"/>
      <text x="695" y="112" text-anchor="middle" font-size="11" font-weight="600" font-family="system-ui" fill="#1d1d1f">GCP (analytics)</text>
      <text x="695" y="128" text-anchor="middle" font-size="9" font-family="system-ui" fill="#7a7a7a">BigQuery · Vertex AI</text>
    </svg>`;
}

// ── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildLanDiagram();
  buildServerDiagram();
  buildRackDiagram();
  buildEnterpriseDiagram();
  buildCloudDiagram();
});
