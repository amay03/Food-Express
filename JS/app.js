(function () {
  function qs(sel, parent) { return (parent || document).querySelector(sel); }
  function qsa(sel, parent) { return Array.from((parent || document).querySelectorAll(sel)); }
  function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
  function load(key, fallback) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }

  // Wire up order buttons to open modal
  function initOrderFlow() {
    const modal = qs('#orderModal');
    const locationInput = qs('#locationInput');
    const estimateText = qs('#estimateText');
    const getEstimateBtn = qs('#getEstimateBtn');
    const proceedPayBtn = qs('#proceedPayBtn');
    const closeModalBtn = qs('#closeModalBtn');

    function openModal() {
      if (!modal) return;
      modal.style.display = 'flex';
      estimateText && (estimateText.classList.add('hidden'), estimateText.textContent = '');
      proceedPayBtn && proceedPayBtn.classList.add('hidden');
      locationInput && (locationInput.value = '', locationInput.focus());
    }

    function closeModal() {
      if (!modal) return;
      modal.style.display = 'none';
    }

    qsa('.order-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        // Treat as add-to-cart by default
        var card = e.currentTarget.closest('.food-card');
        if (card) {
          addToCart({
            name: card.getAttribute('data-item'),
            price: parseFloat(card.getAttribute('data-price') || '0'),
          });
        }
        // Optionally open modal directly if desired; keep cart-first UX
        // openModal();
      });
    });

    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) {
          closeModal();
        }
      });
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', function () { closeModal(); });

    if (getEstimateBtn) {
      getEstimateBtn.addEventListener('click', function () {
        var loc = (locationInput && locationInput.value || '').trim();
        if (!loc) {
          alert('Please enter a city or pincode.');
          return;
        }
        var minutes = 25 + Math.floor(Math.random() * 16); // 25–40
        if (estimateText) {
          estimateText.textContent = 'Your food will arrive in approx. ' + minutes + ' mins.';
          estimateText.classList.remove('hidden');
        }
        save('fx_location', { label: loc, eta: minutes });
        var headerLoc = qs('#headerLocation');
        if (headerLoc) headerLoc.textContent = loc;
        if (proceedPayBtn) proceedPayBtn.classList.remove('hidden');
      });
    }

    if (proceedPayBtn) {
      proceedPayBtn.addEventListener('click', function () {
        // Require auth before payment simulation
        var user = load('fx_user', null);
        if (!user) {
          alert('Please login to proceed to payment.');
          window.location.href = 'login.html';
          return;
        }
        alert('Redirecting to payment...\nPayment successful (simulated).');
        // Save basic order to history
        var orders = load('fx_orders', []);
        var orderId = 'FX' + Math.floor(100000 + Math.random() * 900000);
        orders.unshift({ id: orderId, when: new Date().toISOString(), items: cart.slice(0) });
        save('fx_orders', orders);
        // Close after simulated payment
        // Close after simulated payment
        if (qs('#orderModal')) qs('#orderModal').style.display = 'none';
        // Redirect to track page
        setTimeout(function(){ window.location.href = 'track.html'; }, 300);
      });
    }
  }

  // Simple cart state (in-memory)
  var cart = [];
  function renderCart() {
    var cartItems = qs('#cartItems');
    var cartTotalEl = qs('#cartTotal');
    var cartCount = qs('#cartCount');
    if (!cartItems || !cartTotalEl) return;
    cartItems.innerHTML = '';
    var total = 0;
    cart.forEach(function (item, index) {
      total += item.price * item.qty;
      var row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.justifyContent = 'space-between';
      row.innerHTML = '<div><strong>' + item.name + '</strong><div style="color:#4b5563; font-size:14px;">$' + item.price.toFixed(2) + ' × ' + item.qty + '</div></div>' +
        '<div style="display:flex; gap:6px;">' +
        '<button class="button" data-action="dec" data-index="' + index + '">-</button>' +
        '<button class="button" data-action="inc" data-index="' + index + '">+</button>' +
        '<button class="button" data-action="rem" data-index="' + index + '">Remove</button>' +
        '</div>';
      cartItems.appendChild(row);
    });
    cartTotalEl.textContent = '$' + total.toFixed(2);
    if (cartCount) cartCount.textContent = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    // item controls
    qsa('#cartItems .button').forEach(function (b) {
      b.addEventListener('click', function (e) {
        var idx = parseInt(e.currentTarget.getAttribute('data-index') || '0', 10);
        var action = e.currentTarget.getAttribute('data-action');
        if (action === 'inc') cart[idx].qty += 1;
        if (action === 'dec') cart[idx].qty = Math.max(1, cart[idx].qty - 1);
        if (action === 'rem') cart.splice(idx, 1);
        renderCart();
      });
    });
  }

  function addToCart(item) {
    var existing = cart.find(function (i) { return i.name === item.name; });
    if (existing) existing.qty += 1; else cart.push({ name: item.name, price: item.price, qty: 1 });
    renderCart();
  }

  function initCartDrawer() {
    var drawer = qs('#cartDrawer');
    var openBtn = qs('#openCartBtn');
    var closeBtn = qs('#closeCartBtn');
    var checkoutBtn = qs('#checkoutBtn');
    if (!drawer) return;

    function open() { drawer.style.display = 'flex'; renderCart(); }
    function close() { drawer.style.display = 'none'; }
    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    drawer.addEventListener('click', function (e) { if (e.target === drawer) close(); });
    if (checkoutBtn) checkoutBtn.addEventListener('click', function () {
      // Proceed to location/payment modal
      var orderModal = qs('#orderModal');
      // If no location stored, open location modal; otherwise go straight to payment simulation modal
      var loc = load('fx_location', null);
      if (orderModal) {
        orderModal.style.display = 'flex';
        close();
      } else {
        alert('Proceeding to checkout (simulation).');
      }
    });
  }

  // Search and filters
  function initMenuFilters() {
    var search = qs('#menuSearch');
    var filterButtons = qsa('.filter-btn');
    var cards = qsa('.food-card');
    function apply() {
      var term = (search && search.value || '').trim().toLowerCase();
      var active = (filterButtons.find(function (b) { return b.classList.contains('active'); }) || {}).dataset?.filter || 'all';
      cards.forEach(function (c) {
        var name = (c.getAttribute('data-item') || '').toLowerCase();
        var cat = (c.getAttribute('data-category') || '');
        var matchesTerm = !term || name.indexOf(term) !== -1;
        var matchesCat = active === 'all' || cat === active;
        c.style.display = (matchesTerm && matchesCat) ? '' : 'none';
      });
    }
    if (search) search.addEventListener('input', apply);
    filterButtons.forEach(function (b) {
      b.addEventListener('click', function (e) {
        filterButtons.forEach(function (x) { x.classList.remove('active'); });
        e.currentTarget.classList.add('active');
        apply();
      });
    });
  }

  // Make entire food card (except buttons) navigate to detail page
  function initFoodCardNavigation() {
    qsa('.food-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        var target = e.target;
        if (target.closest && (target.closest('.order-btn') || target.closest('.button'))) return; // ignore button clicks
        var name = card.getAttribute('data-item') || '';
        var price = card.getAttribute('data-price') || '';
        var desc = card.getAttribute('data-desc') || '';
        var img = card.getAttribute('data-img') || '';
        var url = new URL('food.html', window.location.href);
        url.searchParams.set('item', name);
        url.searchParams.set('price', price);
        url.searchParams.set('desc', desc);
        if (img) url.searchParams.set('img', img);
        window.location.href = url.toString();
      });
    });
  }

  // On food.html: render detail content and actions
  function initFoodDetailPage() {
    var title = qs('#foodTitle');
    if (!title) return; // not on detail page
    var params = new URLSearchParams(window.location.search);
    var name = params.get('item') || 'Item';
    var price = parseFloat(params.get('price') || '0');
    var desc = params.get('desc') || '';
    var img = params.get('img') || '';
    title.textContent = name;
    var descEl = qs('#foodDesc');
    if (descEl) descEl.textContent = desc;
    var priceEl = qs('#foodPrice');
    if (priceEl) priceEl.textContent = '$' + price.toFixed(2);
    var imgEl = qs('#foodImage');
    if (imgEl && img) { imgEl.src = img; imgEl.alt = name; }

    var addBtn = qs('#detailAddToCart');
    if (addBtn) addBtn.addEventListener('click', function () { addToCart({ name: name, price: price }); alert('Added to cart.'); });
    var orderBtn = qs('#detailOrderNow');
    if (orderBtn) orderBtn.addEventListener('click', function () {
      addToCart({ name: name, price: price });
      var m = qs('#orderModal');
      if (m) m.style.display = 'flex';
    });
  }

  // Auth: update nav, handle forms
  function initAuth() {
    var user = load('fx_user', null);
    var loginLink = qs('#loginLink');
    var signupLink = qs('#signupLink');
    if (user) {
      if (loginLink) { loginLink.textContent = 'Profile'; loginLink.setAttribute('href', 'profile.html'); }
      if (signupLink) { signupLink.textContent = 'Logout'; signupLink.setAttribute('href', '#'); signupLink.addEventListener('click', function (e) { e.preventDefault(); localStorage.removeItem('fx_user'); location.reload(); }); }
    }

    var loginBtn = qs('#loginBtn');
    if (loginBtn) {
      loginBtn.addEventListener('click', function () {
        var email = (qs('#loginEmail')?.value || '').trim();
        var pwd = (qs('#loginPassword')?.value || '').trim();
        if (!email || !pwd) return alert('Enter email and password.');
        var nameGuess = email.split('@')[0];
        save('fx_user', { name: nameGuess, email: email });
        alert('Logged in as ' + nameGuess);
        window.location.href = 'profile.html';
      });
    }

    var signupBtn = qs('#signupBtn');
    if (signupBtn) {
      signupBtn.addEventListener('click', function () {
        var name = (qs('#signupName')?.value || '').trim();
        var email = (qs('#signupEmail')?.value || '').trim();
        var pwd = (qs('#signupPassword')?.value || '').trim();
        if (!name || !email || !pwd) return alert('Fill all fields.');
        save('fx_user', { name: name, email: email });
        alert('Welcome, ' + name + '!');
        window.location.href = 'profile.html';
      });
    }

    var profileInfo = qs('#profileInfo');
    var logoutBtn = qs('#logoutBtn');
    if (profileInfo) {
      if (!user) { window.location.href = 'login.html'; return; }
      profileInfo.innerHTML = '<div><strong>Name:</strong> ' + user.name + '</div><div><strong>Email:</strong> ' + user.email + '</div>';
      if (logoutBtn) logoutBtn.addEventListener('click', function () { localStorage.removeItem('fx_user'); window.location.href = 'index.html'; });
    }

    var ordersList = qs('#ordersList');
    if (ordersList) {
      if (!user) { window.location.href = 'login.html'; return; }
      var orders = load('fx_orders', []);
      if (!orders.length) { ordersList.textContent = 'No orders yet.'; }
      else {
        ordersList.innerHTML = '';
        orders.forEach(function (o) {
          var div = document.createElement('div');
          div.className = 'category-card';
          var total = (o.items || []).reduce(function (s, it) { return s + it.price * it.qty; }, 0);
          div.innerHTML = '<div style="display:flex; align-items:center; justify-content:space-between;">' +
            '<div><strong>Order ' + o.id + '</strong><div style="color:#4b5563">' + new Date(o.when).toLocaleString() + '</div></div>' +
            '<div><strong>$' + total.toFixed(2) + '</strong></div>' +
          '</div>';
          ordersList.appendChild(div);
        });
      }
    }

    var trackBtn = qs('#trackBtn');
    if (trackBtn) {
      trackBtn.addEventListener('click', function () {
        var id = (qs('#trackIdInput')?.value || '').trim();
        if (!id) return alert('Enter an Order ID.');
        var result = qs('#trackResult');
        if (result) result.textContent = 'Order ' + id + ' is on the way. ETA ~ ' + ((load('fx_location', { eta: 30 })).eta) + ' mins (simulated).';
      });
    }
  }

  // Location controls in header
  function initLocationUI() {
    var setBtn = qs('#setLocationBtn');
    var headerLoc = qs('#headerLocation');
    var data = load('fx_location', null);
    if (data && headerLoc) headerLoc.textContent = data.label;
    if (setBtn) setBtn.addEventListener('click', function () { var m = qs('#orderModal'); if (m) m.style.display = 'flex'; });
    // On first visit without location, auto prompt if modal exists
    if (!data) {
      var modal = qs('#orderModal');
      if (modal) modal.style.display = 'flex';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initOrderFlow();
    initCartDrawer();
    initMenuFilters();
    initFoodCardNavigation();
    initFoodDetailPage();
    initAuth();
    initLocationUI();
  });
})();


