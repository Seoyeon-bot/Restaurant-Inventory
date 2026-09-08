const seed = {
  inventory: [
    { id: 1, name: 'Chicken breast', quantity: 12, unit: 'lb', cost: 4.8, threshold: 6 },
    { id: 2, name: 'Jasmine rice', quantity: 5, unit: 'lb', cost: 1.2, threshold: 8 },
    { id: 3, name: 'Tomatoes', quantity: 10, unit: 'lb', cost: 2.5, threshold: 5 },
    { id: 4, name: 'Avocado', quantity: 7, unit: 'each', cost: 1.4, threshold: 4 },
    { id: 5, name: 'Limes', quantity: 20, unit: 'each', cost: 0.35, threshold: 12 }
  ],
  recipes: [
    { id: 1, name: 'Chicken Rice Bowl', price: 14, ingredients: [{name:'Chicken breast',qty:.5},{name:'Jasmine rice',qty:.3},{name:'Tomatoes',qty:.15},{name:'Avocado',qty:.25}] },
    { id: 2, name: 'Tomato Rice Bowl', price: 11, ingredients: [{name:'Jasmine rice',qty:.35},{name:'Tomatoes',qty:.5},{name:'Avocado',qty:.25},{name:'Limes',qty:1}] }
  ],
  purchases: [{ id: 1, date: new Date().toISOString().slice(0,10), item: 'Chicken breast', quantity: 8, cost: 4.6, supplier: 'Fresh Fields' }]
};
let state = JSON.parse(localStorage.getItem('pantryPilotData')) || structuredClone(seed);
let activeFilter = 'all';
const money = n => `$${Number(n || 0).toFixed(2)}`;
const save = () => localStorage.setItem('pantryPilotData', JSON.stringify(state));
const findItem = name => state.inventory.find(i => i.name.toLowerCase() === name.toLowerCase());
function recipeCost(recipe) { return recipe.ingredients.reduce((sum, part) => sum + ((findItem(part.name)?.cost || 0) * part.qty), 0); }
function render() {
  const low = state.inventory.filter(i => i.quantity <= i.threshold);
  document.querySelector('#inventoryValue').textContent = money(state.inventory.reduce((sum,i) => sum + i.quantity*i.cost,0));
  document.querySelector('#lowStockCount').textContent = low.length;
  const avg = state.recipes.length ? state.recipes.reduce((sum,r) => sum + recipeCost(r)/r.price*100,0)/state.recipes.length : 0;
  document.querySelector('#averageFoodCost').textContent = `${avg.toFixed(1)}%`;
  const month = new Date().toISOString().slice(0,7);
  document.querySelector('#purchaseTotal').textContent = money(state.purchases.filter(p=>p.date.startsWith(month)).reduce((sum,p)=>sum+p.quantity*p.cost,0));
  const query = document.querySelector('#inventorySearch').value.toLowerCase();
  const items = state.inventory.filter(i => (activeFilter === 'all' || i.quantity <= i.threshold) && i.name.toLowerCase().includes(query));
  document.querySelector('#inventoryRows').innerHTML = items.map(i => `<tr><td>${i.name}</td><td>${i.quantity} ${i.unit}</td><td>${money(i.cost)}</td><td><span class="badge ${i.quantity<=i.threshold?'low':''}">${i.quantity<=i.threshold?'Low stock':'In stock'}</span></td><td><button class="icon-button" title="Delete ${i.name}" data-delete="${i.id}">×</button></td></tr>`).join('') || '<tr><td colspan="5" class="empty">No matching ingredients.</td></tr>';
  document.querySelector('#recipeCards').innerHTML = state.recipes.map(r => { const cost=recipeCost(r), food=cost/r.price*100; return `<article class="recipe"><div class="recipe-title"><h3>${r.name}</h3><button class="icon-button" title="Remove ${r.name}" data-delete-recipe="${r.id}">×</button></div><span class="cost">${money(cost)}</span> <small>per serving</small><p>Menu price ${money(r.price)} · Food cost ${food.toFixed(1)}%</p><div class="meter"><i style="width:${Math.min(food,100)}%"></i></div><p>${r.ingredients.map(x=>`${x.qty} ${findItem(x.name)?.unit||''} ${x.name}`).join(' · ')}</p></article>`; }).join('') || '<p class="empty">No recipes yet.</p>';
  document.querySelector('#purchaseList').innerHTML = state.purchases.slice().reverse().map(p=>`<article class="purchase"><span class="purchase-date">${p.date}</span><div><b>${p.item} · ${p.quantity} ${findItem(p.item)?.unit || 'units'}</b><small>${p.supplier} · ${money(p.cost)} per unit</small></div><span class="amount">${money(p.quantity*p.cost)}</span></article>`).join('') || '<p class="empty">No purchases logged.</p>';
  document.querySelector('#purchaseItem').innerHTML = state.inventory.map(i=>`<option>${i.name}</option>`).join('');
}

function addChat(text,type='bot') { const el=document.createElement('div'); el.className=`${type}-message`; el.textContent=text; document.querySelector('#chatLog').append(el); el.parentElement.scrollTop=el.parentElement.scrollHeight; }
function handleAssistant(raw) {
  const text=raw.trim(), lower=text.toLowerCase(); if(!text)return;
  addChat(text,'user');
  if (/low stock|low-stock|needs attention/.test(lower)) { const low=state.inventory.filter(i=>i.quantity<=i.threshold); addChat(low.length ? `Low stock: ${low.map(i=>`${i.name} (${i.quantity} ${i.unit}, reorder at ${i.threshold})`).join('; ')}.` : 'Everything is above its reorder level.'); }
  else if (/cost|food cost/.test(lower)) { const requested=lower.replace(/calculate|what(?:'s| is)|the|cost|of|food/gi,'').trim().split(/\s+/).filter(Boolean); const match=state.recipes.find(r=>requested.every(word=>r.name.toLowerCase().includes(word))); if(match) { const cost=recipeCost(match); addChat(`${match.name} costs ${money(cost)} per serving. At a ${money(match.price)} menu price, food cost is ${(cost/match.price*100).toFixed(1)}%.`); } else addChat(`I couldn't match a recipe. Available recipes: ${state.recipes.map(r=>r.name).join(', ')}.`); }
  else { const purchase = lower.match(/(?:record )?purchase\s+(\d+(?:\.\d+)?)\s+(\w+)\s+(.+?)\s+at\s+\$?(\d+(?:\.\d+)?)(?:\s+from\s+(.+))?$/); const add = lower.match(/add\s+(\d+(?:\.\d+)?)\s+(\w+)\s+(.+?)\s+at\s+\$?(\d+(?:\.\d+)?)$/); const parsed=purchase||add;
    if(parsed) { const [,quantity,unit,name,cost,supplier]=parsed; let item=findItem(name); if(!item) { item={id:Date.now(),name:name.replace(/\b\w/g,c=>c.toUpperCase()),quantity:0,unit,cost:Number(cost),threshold:Number(quantity)/2}; state.inventory.push(item); } item.quantity+=Number(quantity); item.cost=Number(cost); if(purchase) state.purchases.push({id:Date.now(),date:new Date().toISOString().slice(0,10),item:item.name,quantity:Number(quantity),cost:Number(cost),supplier:supplier||'Unspecified supplier'}); save(); render(); addChat(`${purchase?'Purchase recorded':'Inventory updated'}: ${quantity} ${unit} ${item.name} at ${money(cost)} each.`); }
    else addChat('I can help with low stock, recipe costs, adding inventory, and recording purchases. Try one of the example commands below.'); }
}

document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>document.querySelector(`#${b.dataset.open}`).showModal()));
document.querySelector('#inventorySearch').addEventListener('input',render);
document.querySelectorAll('.chip').forEach(b=>b.addEventListener('click',()=>{activeFilter=b.dataset.filter;document.querySelectorAll('.chip').forEach(x=>x.classList.toggle('active',x===b));render();}));
document.querySelector('#inventoryRows').addEventListener('click',e=>{if(e.target.dataset.delete){state.inventory=state.inventory.filter(i=>i.id!==Number(e.target.dataset.delete));save();render();}});
document.querySelector('#inventoryForm').addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));state.inventory.push({id:Date.now(),name:d.name,quantity:+d.quantity,unit:d.unit,cost:+d.cost,threshold:+d.threshold});save();render();e.target.closest('dialog').close();e.target.reset();});
document.querySelector('#recipeForm').addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const ingredients=d.ingredients.split(',').map(v=>{const [name,qty]=v.trim().split(':');return {name:name.trim(),qty:+qty};}).filter(x=>x.name&&!Number.isNaN(x.qty));const missing=ingredients.filter(x=>!findItem(x.name)).map(x=>x.name);if(!ingredients.length){alert('Add at least one ingredient using the format Item name:quantity.');return;}if(missing.length){alert(`Add these items to Inventory Counts first, or correct their spelling: ${missing.join(', ')}.`);return;}state.recipes.push({id:Date.now(),name:d.name,price:+d.price,ingredients});save();render();e.target.closest('dialog').close();e.target.reset();});
document.querySelector('#recipeCards').addEventListener('click',e=>{if(e.target.dataset.deleteRecipe){state.recipes=state.recipes.filter(r=>r.id!==Number(e.target.dataset.deleteRecipe));save();render();}});
document.querySelector('#purchaseForm').addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const item=findItem(d.item);item.quantity+=+d.quantity;item.cost=+d.cost;state.purchases.push({id:Date.now(),date:new Date().toISOString().slice(0,10),item:d.item,quantity:+d.quantity,cost:+d.cost,supplier:d.supplier});save();render();e.target.closest('dialog').close();e.target.reset();});
document.querySelector('#assistantForm').addEventListener('submit',e=>{e.preventDefault();handleAssistant(document.querySelector('#assistantInput').value);document.querySelector('#assistantInput').value='';});
document.querySelectorAll('[data-prompt]').forEach(b=>b.addEventListener('click',()=>handleAssistant(b.dataset.prompt)));
document.querySelector('#resetButton').addEventListener('click',()=>{if(confirm('Restore the original demo data?')){state=structuredClone(seed);save();render();}});
render();