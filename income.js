
  
function round(n){
  return Math.round(n);
}

function loadEmpSignature(event){

  const file = event.target.files[0];
  if(!file) return;

  const reader = new FileReader();

  reader.onload = function(e){

    const img = document.getElementById("empSignPreview");
    img.src = e.target.result;

    img.onload = function(){

      const boxWidth  = 260;   // signature box width
      const boxHeight = 55;    // max height above line

      const imgRatio  = img.naturalWidth / img.naturalHeight;
      const boxRatio  = boxWidth / boxHeight;

      if(imgRatio > boxRatio){
        img.style.width  = "100%";
        img.style.height = "auto";
      }else{
        img.style.height = boxHeight + "px";
        img.style.width  = "auto";
      }

    };

  };

  reader.readAsDataURL(file);
}

// ========= VALUE HELPER =========
function val(id){
  return Number(document.getElementById(id).value) || 0;
}

// ========= TAX SLAB (NEW REGIME FY 2024-25) =========
function calcTax(income){

  let tax = 0;

  if(income <= 300000){
    tax = 0;
  }
  else if(income <= 700000){
    tax = (income - 300000) * 0.05;
  }
  else if(income <= 1000000){
    tax = 20000 + (income - 700000) * 0.10;
  }
  else if(income <= 1200000){
    tax = 50000 + (income - 1000000) * 0.15;
  }
  else if(income <= 1500000){
    tax = 80000 + (income - 1200000) * 0.20;
  }
  else{
    tax = 140000 + (income - 1500000) * 0.30;
  }

  return tax;
}

// ========= MAIN CALC =========
function calc(){

  // 2
  let t2 = val('g1a') + val('g1b');
  document.getElementById('t2').value = t2;

  // 5 (3 & 4 Nil)
  let t5 = t2;
  document.getElementById('t5').value = t5;

  // 7
  let t7 = 75000 + val('ptax');
  document.getElementById('t7').value = t7;

  // 9
  let t9 = t5 - t7 + val('i8');
  document.getElementById('t9').value = t9;

  // 11
  // 11 (Sec 10 Nil)
let t11 = 0;
document.getElementById('t11').value = t11;

// 13 (VI-A input)
let t13 = val('d12') || 0;
document.getElementById('t13').value = t13;

// 15 Net taxable
let t15 = t9 - t11 - t13;
document.getElementById('t15').value = t15;

  // 16 Tax slab auto
  let tax16 = round(calcTax(t15));
document.getElementById('tax16').value = tax16;

  // 17 Rebate
  let rebate = (t15 <= 700000) ? tax16 : 0;
rebate = round(rebate);
document.getElementById('rebate17').value = rebate;
// 18
let t18 = tax16 - rebate;
t18 = round(t18);
document.getElementById('t18').value = t18;

// 19 Cess 4%
let t19 = round(t18 * 0.04);
document.getElementById('t19').value = t19;

// 21
let t21 = round(t18 + t19 - val('relief20'));
document.getElementById('t21').value = t21;

// 23 Final
let t23 = round(t21 - val('tds22'));
document.getElementById('t23').value = t23;
}

// ========= AUTO CALC ON INPUT =========
document.querySelectorAll('input').forEach(i=>{
  i.addEventListener('input', calc);
});


// ========= PRINT =========
function printForm(){
  const name = document.querySelector(".emp-name")?.value || "Employee";
  document.title = "Income_Tax_" + name.replace(/\s+/g,"_");
  window.print();
}

// ========= DOWNLOAD (PRINT TO PDF) =========



const label = document.getElementById("floatingLabel");

document.querySelectorAll("input").forEach(inp=>{

  inp.addEventListener("focus", ()=>{

    let td = inp.closest("td");
    if(!td) return;

    let text = td.previousElementSibling?.innerText || "";

    const label = document.getElementById("floatingLabel");

    label.innerText = text;
    label.style.display = "block";

    td.appendChild(label);   // 🔥 attach inside cell

  });

  inp.addEventListener("blur", ()=>{
    document.getElementById("floatingLabel").style.display = "none";
  });

});

document.querySelectorAll(".emp-name").forEach(inp=>{

  inp.addEventListener("input", function(){

    this.style.width = (this.value.length + 3) + "ch";

  });

});
// ===== REMOVE PLACEHOLDER BEFORE PRINT =====
window.addEventListener("beforeprint", function(){

  document.querySelectorAll("input, textarea").forEach(el=>{
    el.dataset.ph = el.getAttribute("placeholder"); // store
    el.removeAttribute("placeholder");              // remove
  });

});

// ===== RESTORE AFTER PRINT =====
window.addEventListener("afterprint", function(){

  document.querySelectorAll("input, textarea").forEach(el=>{
    if(el.dataset.ph){
      el.setAttribute("placeholder", el.dataset.ph);
    }
  });

});
function changeYear(){

  let year = document.getElementById("financialYear").value;

  document.querySelector("h3:nth-of-type(1)").innerText =
    "FOR THE FINANCIAL YEAR " + year;

  document.querySelector("h3:nth-of-type(2)").innerText =
    "(Assessment Year " + (parseInt(year.split("-")[0]) + 1) +
    "-" + (parseInt(year.split("-")[1]) + 1) + ")";

  localStorage.setItem("selectedYear", year);
}

window.addEventListener("load", function(){
  let savedYear = localStorage.getItem("selectedYear");
  if(savedYear){
    document.getElementById("financialYear").value = savedYear;
    changeYear();
  }
});

// ===== AUTO SAVE =====
function saveData(){
  const inputs = document.querySelectorAll("input, textarea");
  let data = {};

  inputs.forEach(el=>{
    if(el.id){
      data[el.id] = el.value;
    }
  });

  localStorage.setItem("taxFormData", JSON.stringify(data));
}

function loadData(){
  let data = JSON.parse(localStorage.getItem("taxFormData") || "{}");

  Object.keys(data).forEach(id=>{
    const el = document.getElementById(id);
    if(el){
      el.value = data[id];
    }
  });

  calc();
}

document.querySelectorAll("input, textarea").forEach(el=>{
  el.addEventListener("input", saveData);
});

window.addEventListener("load", loadData);