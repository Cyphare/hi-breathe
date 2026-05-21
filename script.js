document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const siteHeader = document.getElementById('site-header');
    const siteFooter = document.getElementById('site-footer');

    const headerNavItems = [
        { href: 'research.html', label: 'Research +' },
        { href: 'team.html', label: 'Team +' },
        { href: 'publication.html', label: 'Publication +' },
        { href: 'about.html', label: 'About +' },
        { href: 'contact.html', label: 'Contact +' },
    ];

    const footerLinks = [
        { href: 'research.html', label: 'Research' },
        { href: 'about.html', label: 'About' },
        { href: 'publication.html', label: 'Publication' },
        { href: 'team.html', label: 'Team' },
        { href: 'contact.html', label: 'Contact' },
    ];

    const navMarkup = headerNavItems
        .map(({ href, label }) => `<li><a href="${href}"><i>${label}</i></a></li>`)
        .join('');

    const footerLinksMarkup = footerLinks
        .map(({ href, label }) => `<a href="${href}">${label}</a>`)
        .join('');

    if (siteHeader) {
        siteHeader.innerHTML = `
            <div class="header-titles">
                <h1><a href="index.html">Breathe Laboratory</a></h1>
                <p>Department of Electrical Engineering and Information Engineering UGM</p>
            </div>
            <nav>
                <ul>
                    ${navMarkup}
                </ul>
            </nav>
        `;
    }

    if (siteFooter) {
        siteFooter.innerHTML = `
            <div class="footer-top">
                <h2>Breathe Laboratory</h2>
            </div>
            <div class="footer-content">
                <div class="footer-links">
                    ${footerLinksMarkup}
                </div>
                <div class="footer-location">
                    <p><strong>Our Location:</strong><br>
                    Department of Electrical Engineering and Information Engineering<br>
                    Faculty of Engineering<br>
                    Universitas Gadjah Mada<br>
                    Yogyakarta, Indonesia</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 Breathe Laboratory, DTETI FT UGM. All rights reserved.</p>
            </div>
        `;
    }

    const contactForm = document.getElementById('contactForm');
    const contactEmail = 'example@dteti.ugm.ac.id';

    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const name = document.getElementById('name')?.value.trim() || 'Anonymous';
            const email = document.getElementById('email')?.value.trim() || 'Not provided';
            const interest = document.getElementById('interest')?.value.trim() || 'Not provided';
            const message = document.getElementById('message')?.value.trim() || '';

            const subject = encodeURIComponent(`Website inquiry from ${name}`);
            const body = encodeURIComponent(
                `Name/Organization: ${name}\n` +
                `Email Address: ${email}\n` +
                `Area of Interest: ${interest}\n\n` +
                `Message:\n${message}\n`
            );

            window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
        });
    }

    const sortBtn = document.getElementById('sortBtn');
    const sortDropdown = document.getElementById('sortDropdown');
    const sortConfirmBtn = document.getElementById('sortConfirmBtn');
    const searchInput = document.querySelector('.search-input');
    const searchConfirmBtn = document.getElementById('searchConfirmBtn');
    const pubCards = document.querySelectorAll('.pub-card');

    const closeSortDropdown = () => {
        sortDropdown?.classList.remove('show');
    };

    const applyPublicationSearch = () => {
        if (!searchInput || pubCards.length === 0) {
            return;
        }

        const query = searchInput.value.trim().toLowerCase();

        pubCards.forEach((card) => {
            const cardText = card.textContent.toLowerCase();
            card.style.display = query === '' || cardText.includes(query) ? '' : 'none';
        });
    };

    if (sortBtn && sortDropdown) {
        sortBtn.addEventListener('click', (event) => {
            sortDropdown.classList.toggle('show');
            event.stopPropagation();
        });

        document.addEventListener('click', (event) => {
            if (!sortDropdown.contains(event.target) && event.target !== sortBtn) {
                closeSortDropdown();
            }
        });

        const setupSortGroup = (groupId) => {
            const group = document.getElementById(groupId);
            if (!group) return;

            const buttons = group.querySelectorAll('.sort-option');
            buttons.forEach((button) => {
                button.addEventListener('click', () => {
                    buttons.forEach((btn) => btn.classList.remove('active'));
                    button.classList.add('active');
                });
            });
        };

        setupSortGroup('sortType');
        setupSortGroup('sortOrder');
    }

    if (sortConfirmBtn && sortDropdown) {
        sortConfirmBtn.addEventListener('click', () => {
            closeSortDropdown();
        });
    }

    if (searchConfirmBtn && searchInput) {
        searchConfirmBtn.addEventListener('click', applyPublicationSearch);
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                applyPublicationSearch();
            }
        });
    }

    const majorCards = document.querySelectorAll('.major-card');
    const dynamicBanner = document.getElementById('dynamic-banner');
    const dynamicTitle = document.getElementById('dynamic-title');
    const gridsContainer = document.getElementById('project-grids-container');
    const projectGrids = document.querySelectorAll('.project-grid-section');

    if (majorCards.length === 0 || !dynamicBanner || !dynamicTitle || !gridsContainer) {
        return;
    }

    if (projectGrids.length > 0) {
        projectGrids.forEach((grid) => {
            grid.style.display = 'none';
            grid.hidden = true;
        });
    }

    majorCards.forEach((card) => {
        card.addEventListener('click', () => {
            const targetId = card.getAttribute('data-target');
            const targetTitle = card.getAttribute('data-title');

            if (!targetId || !targetTitle) {
                return;
            }

            dynamicTitle.textContent = targetTitle;

            projectGrids.forEach((grid) => {
                grid.classList.remove('active-grid');
                grid.style.display = 'none';
                grid.hidden = true;
            });

            const activeGrid = document.getElementById(targetId);
            if (activeGrid) {
                activeGrid.classList.add('active-grid');
                activeGrid.style.display = 'grid';
                activeGrid.hidden = false;
            }

            dynamicBanner.style.display = 'block';
            gridsContainer.style.display = 'block';
            dynamicBanner.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
});