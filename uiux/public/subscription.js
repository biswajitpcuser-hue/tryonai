// Subscription screen - uses grid-background CSS from globals.css
// This file can be imported or used as a standalone page

const subscriptionPlans = [
  {
    name: "Basic",
    price: "$9.99",
    period: "/month",
    features: ["Real-time signals", "Basic analytics", "Email support"],
    popular: false,
  },
  {
    name: "Pro",
    price: "$19.99",
    period: "/month",
    features: ["Everything in Basic", "AI predictions", "Priority support", "Advanced analytics"],
    popular: true,
  },
  {
    name: "Elite",
    price: "$49.99",
    period: "/month",
    features: ["Everything in Pro", "VIP signals", "Dedicated manager", "API access"],
    popular: false,
  },
];

function renderSubscriptionScreen(root) {
  root.innerHTML = `
    <div class="grid-wrapper">
      <div class="grid-background"></div>
      <div style="position:relative;z-index:1;max-width:575px;margin:0 auto;padding:40px 20px;">
        <h1 style="text-align:center;font-size:32px;color:#17251f;margin-bottom:8px;">Choose Your Plan</h1>
        <p style="text-align:center;color:#6f7a75;margin-bottom:32px;">Unlock premium trading features</p>
        <div style="display:grid;gap:16px;">
          ${subscriptionPlans.map((plan, i) => `
            <div style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:${plan.popular ? '2px solid #00985b' : '1px solid #edf0ee'};position:relative;${plan.popular ? 'transform:scale(1.02);' : ''}">
              ${plan.popular ? '<span style="position:absolute;top:-10px;right:20px;background:#00985b;color:#fff;padding:4px 14px;border-radius:999px;font-size:12px;font-weight:700;">POPULAR</span>' : ''}
              <h2 style="margin:0 0 4px;font-size:20px;color:#17251f;">${plan.name}</h2>
              <div style="margin:12px 0;">
                <span style="font-size:36px;font-weight:900;color:#00985b;">${plan.price}</span>
                <span style="color:#6f7a75;font-size:14px;">${plan.period}</span>
              </div>
              <ul style="list-style:none;padding:0;margin:0 0 20px;">
                ${plan.features.map(f => `
                  <li style="padding:6px 0;color:#53605b;font-size:14px;">✓ ${f}</li>
                `).join('')}
              </ul>
              <button style="width:100%;padding:14px;border:none;border-radius:8px;background:${plan.popular ? 'linear-gradient(180deg,#02a865,#008f52)' : '#fff'};color:${plan.popular ? '#fff' : '#00985b'};font-size:16px;font-weight:700;border:${plan.popular ? 'none' : '2px solid #00985b'};cursor:pointer;">Get Started</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
