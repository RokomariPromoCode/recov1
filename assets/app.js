// assets/app.js
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('header-search-input');
  const resultsContainer = document.getElementById('header-search-results');
  const clearBtn = document.getElementById('search-clear');
  const searchLens = document.getElementById('search-lens');
  const hamburger = document.getElementById('hamburgerBtn');
  const menuLinks = document.getElementById('menuLinks');

  // 1. mobile menu toggle with staggered animation
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      menuLinks.classList.toggle('active');
      const icon = hamburger.querySelector('i');
      if (menuLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  }

  // close when clicking outside
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !menuLinks.contains(e.target) && menuLinks.classList.contains('active')) {
      menuLinks.classList.remove('active');
      const icon = hamburger.querySelector('i');
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
  });

  // 2. product database from .product-card data attributes
  let productDatabase = [];
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    productDatabase.push({
      title: card.getAttribute('data-title'),
      img: card.getAttribute('data-img'),
      href: card.getAttribute('data-href')
    });
  });

  // sample fallback entries
  productDatabase.push(
    { title: "ল্যাপটপ - এইচপি কোর আই ৫", img: "https://via.placeholder.com/50", href: "/electronics.html" },
    { title: "মিনিকেট চাল - ৫ কেজি", img: "https://via.placeholder.com/50", href: "/groceries.html" }
  );

  // 3. search logic
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const query = this.value.trim().toLowerCase();

      if (query.length > 0) {
        clearBtn.style.display = 'block';
        searchLens.style.display = 'none';
      } else {
        clearBtn.style.display = 'none';
        searchLens.style.display = 'block';
        resultsContainer.style.display = 'none';
        return;
      }

      const matches = productDatabase.filter(product => product.title.toLowerCase().includes(query));

      resultsContainer.style.display = 'block';
      resultsContainer.innerHTML = '';

      if (matches.length > 0) {
        matches.forEach(product => {
          const a = document.createElement('a');
          a.className = 'result-item';
          a.href = product.href || '#';
          a.innerHTML = `
            <img src="${product.img}" alt="img">
            <div class="result-info">
              <h4 style="margin:0;font-size:14px">${product.title}</h4>
            </div>
          `;
          resultsContainer.appendChild(a);
        });
      } else {
        resultsContainer.innerHTML = `
          <div class="no-result-box">
            <p>কোনো প্রোডাক্ট পাওয়া যায়নি!</p>
            <button class="request-btn-small" onclick="triggerRequest('${escapeHtml(this.value)}')">
              ডিসকাউন্ট রিকুয়েষ্ট পাঠান
            </button>
          </div>
        `;
      }
    });
  }

  // 4. clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      searchInput.value = '';
      resultsContainer.style.display = 'none';
      clearBtn.style.display = 'none';
      searchLens.style.display = 'block';
      searchInput.focus();
    });
  }

  // 5. request button function accessible globally
  window.triggerRequest = function(searchTerm) {
    // hide dropdown
    resultsContainer.style.display = 'none';
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    if (searchLens) searchLens.style.display = 'block';

    const requestArea = document.getElementById('request-area') || document.getElementById('footer');
    const productInput = document.getElementById('product-name');

    if (requestArea) {
      requestArea.scrollIntoView({ behavior: 'smooth' });
      if (productInput) {
        productInput.value = searchTerm;
        setTimeout(() => productInput.focus(), 800);
      }
    } else {
      alert("রিকোয়েস্ট ফর্মের জন্য পেজের নিচে যান।");
    }
  };

  // small helper to escape single quotes inside inline JS call
  function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/'/g, "\\'");
  }
});
