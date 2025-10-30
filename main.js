
(function () {
  const SHEET_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS08vj4GWt3uSAtn0P0zx42Z4TMYq91lvDKJXVBDMvAfnw63jk1ZaLmlpa337lWmMMHFKVes0iibDkT/pub?output=csv';

  
  const loginBox = document.getElementById('loginBox');
  const tableContainer = document.getElementById('tableContainer');
  const loginBtn = document.getElementById('loginBtn');
  const errEl = document.getElementById('error');
  const logoutBtn = document.getElementById('logoutBtn');

 
  const isLogged = () => localStorage.getItem('hw_logged') === '1';
  const setLogged = (v) => localStorage.setItem('hw_logged', v ? '1' : '0');

  
  function showTableUI() {
    loginBox.classList.add('hidden');
    tableContainer.classList.remove('hidden');
  }
  function showLoginUI() {
    loginBox.classList.remove('hidden');
    tableContainer.classList.add('hidden');
  }


  function parseCSV(text) {
    const rows = text.trim().split('\n').map(row => {
   
      const cells = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === '"' ) {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          cells.push(cur);
          cur = '';
        } else {
          cur += ch;
        }
      }
      cells.push(cur);
      return cells.map(c => c.replace(/^"|"$/g, '').trim());
    });
    return rows;
  }

 
  function renderTable(rows) {
    const headEl = document.getElementById('table-head');
    const bodyEl = document.getElementById('table-body');
    if (!rows || rows.length === 0) {
      headEl.innerHTML = '';
      bodyEl.innerHTML = '<tr><td colspan="1">No data</td></tr>';
      return;
    }
    const header = rows[0];
    const body = rows.slice(1);

    headEl.innerHTML = '<tr>' + header.map(h => `<th>${escapeHtml(h || '')}</th>`).join('') + '</tr>';
    bodyEl.innerHTML = body.map(r => '<tr>' + r.map(c => `<td>${escapeHtml(c || '')}</td>`).join('') + '</tr>').join('');
  }

  
  function escapeHtml(s) {
    return (s + '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }


  async function loadSheet() {
  try {
    const res = await fetch(SHEET_CSV);
    if (!res.ok) throw new Error('Sheet fetch failed');
    const text = await res.text();
    const rows = parseCSV(text);

    // ✅ Sort the data here (without touching the original sheet)
    // rows[0] = header row
    const header = rows[0];
    const body = rows.slice(1);

    // Example: sort by "Completed Rooms" (replace 3 with your column index, 0-based)
    // Assuming column 3 (4th column) has numeric values you want in descending order
    body.sort((a, b) => {
      const valA = parseFloat(a[3]) || 0;
      const valB = parseFloat(b[3]) || 0;
      return valB - valA; // Descending order
    });

    // Combine header + sorted rows back together
    const sortedRows = [header, ...body];

    renderTable(sortedRows);

  } catch (e) {
    console.error(e);
    document.getElementById('table-body').innerHTML =
      `<tr><td colspan="99" style="color:#ff6666;text-align:center">Failed to load sheet</td></tr>`;
  }
}


 
  loginBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    errEl.textContent = '';
    const u = (document.getElementById('username').value || '').trim();
    const p = (document.getElementById('password').value || '').trim();
    if (!u || !p) {
      errEl.textContent = 'Enter both username and password.';
      return;
    }

    
    if (window.AUTH && u === window.AUTH.username && p === window.AUTH.password) {
      setLogged(true);
      showTableUI();
      loadSheet();
    } else {
      errEl.textContent = 'Invalid username or password.';
    }
  });

  logoutBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    setLogged(false);
    showLoginUI();

    document.getElementById('table-head').innerHTML = '';
    document.getElementById('table-body').innerHTML = '';
  });

 
  if (isLogged()) {
    showTableUI();
    loadSheet();
  } else {
    showLoginUI();
  }
})();
