document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const siteHeader = document.getElementById('site-header');
    const siteFooter = document.getElementById('site-footer');
    const hasGsapScroll = typeof window.gsap !== 'undefined' && typeof window.ScrollToPlugin !== 'undefined';

    if (hasGsapScroll) {
        window.gsap.registerPlugin(window.ScrollToPlugin);
    }

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const canUseGsapInertialScroll = hasGsapScroll && !prefersReducedMotion;
    let wheelScrollTween = null;
    let setInertialScrollTarget = null;

    const getMaxScrollY = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    let maxScrollY = getMaxScrollY();
    const clampScrollY = (value) => Math.min(maxScrollY, Math.max(0, value));

    const setupInertialWheelScroll = () => {
        if (!canUseGsapInertialScroll) {
            return;
        }

        let targetScrollY = clampScrollY(window.pageYOffset || 0);
        setInertialScrollTarget = (value) => {
            targetScrollY = clampScrollY(value);
        };

        const restartWheelTween = () => {
            if (!wheelScrollTween) {
                wheelScrollTween = window.gsap.to(window, {
                    duration: 1,
                    ease: 'power3.out',
                    paused: true,
                    scrollTo: {
                        y: targetScrollY,
                        autoKill: false,
                    },
                });
            } else {
                wheelScrollTween.vars.scrollTo.y = targetScrollY;
                wheelScrollTween.invalidate();
            }

            wheelScrollTween.restart();
        };

        const syncTargetWithWindowScroll = () => {
            if (!wheelScrollTween || !wheelScrollTween.isActive()) {
                targetScrollY = clampScrollY(window.pageYOffset || 0);
            }
        };

        const hasScrollableParent = (element) => {
            let currentElement = element instanceof Element ? element : null;

            while (currentElement && currentElement !== document.body) {
                const style = window.getComputedStyle(currentElement);
                const canScrollY = /(auto|scroll|overlay)/.test(style.overflowY);
                if (canScrollY && currentElement.scrollHeight > currentElement.clientHeight) {
                    return true;
                }

                currentElement = currentElement.parentElement;
            }

            return false;
        };

        let scrollSyncFrame = null;
        window.addEventListener('scroll', () => {
            if (scrollSyncFrame) {
                return;
            }

            scrollSyncFrame = window.requestAnimationFrame(() => {
                syncTargetWithWindowScroll();
                scrollSyncFrame = null;
            });
        }, { passive: true });
        let resizeAnimationFrame = null;
        window.addEventListener('resize', () => {
            if (resizeAnimationFrame) {
                window.cancelAnimationFrame(resizeAnimationFrame);
            }

            resizeAnimationFrame = window.requestAnimationFrame(() => {
                maxScrollY = getMaxScrollY();
                targetScrollY = clampScrollY(targetScrollY);
                resizeAnimationFrame = null;
            });
        });

        window.addEventListener('load', () => {
            maxScrollY = getMaxScrollY();
            targetScrollY = clampScrollY(targetScrollY);
        }, { once: true });

        window.addEventListener('wheel', (event) => {
            if (event.ctrlKey || event.metaKey) {
                return;
            }

            if (event.defaultPrevented || maxScrollY <= 0 || hasScrollableParent(event.target)) {
                return;
            }

            if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
                return;
            }

            event.preventDefault();
            targetScrollY = clampScrollY(targetScrollY + event.deltaY);
            restartWheelTween();
        }, { passive: false });
    };

    setupInertialWheelScroll();

    let headerOffset = siteHeader?.offsetHeight || 0;
    const updateHeaderOffset = () => {
        headerOffset = siteHeader?.offsetHeight || 0;
    };

    window.addEventListener('resize', updateHeaderOffset);

    const normalizePathname = (pathname) => {
        const normalized = pathname.replace(/\/index\.html$/, '/').replace(/\/+$/, '');
        return normalized === '' ? '/' : normalized;
    };
    const currentNormalizedPath = normalizePathname(window.location.pathname);

    const getScrollTargetY = (element) => {
        if (!element) {
            return 0;
        }

        return Math.max(0, element.getBoundingClientRect().top + window.pageYOffset - headerOffset);
    };

    const smoothScrollToY = (targetY) => {
        const scrollTop = Math.max(0, targetY);

        if (hasGsapScroll) {
            if (wheelScrollTween) {
                wheelScrollTween.kill();
            }

            if (setInertialScrollTarget) {
                setInertialScrollTarget(scrollTop);
            }

            window.gsap.to(window, {
                duration: 0.8,
                ease: 'power2.out',
                scrollTo: {
                    y: scrollTop,
                    autoKill: true,
                },
            });
            return;
        }

        window.scrollTo({
            top: scrollTop,
            behavior: 'smooth',
        });
    };

    const smoothScrollToElement = (element) => {
        if (!element) {
            return;
        }

        smoothScrollToY(getScrollTargetY(element));
    };

    const smoothScrollToHash = (hash, updateHistory = true) => {
        if (!hash || hash === '#') {
            return false;
        }

        let target;
        try {
            target = document.querySelector(hash);
        } catch (error) {
            return false;
        }

        if (!target) {
            return false;
        }

        smoothScrollToElement(target);

        if (updateHistory) {
            if (window.location.hash === hash) {
                history.replaceState(null, '', hash);
            } else {
                history.pushState(null, '', hash);
            }
        }

        return true;
    };

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

    document.querySelectorAll('a[href]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href || !href.includes('#')) {
            return;
        }

        let targetUrl;
        try {
            targetUrl = new URL(link.href, window.location.href);
        } catch (error) {
            return;
        }

        if (targetUrl.origin !== window.location.origin) {
            return;
        }

        const isSamePage = normalizePathname(targetUrl.pathname) === currentNormalizedPath;
        if (!isSamePage || !targetUrl.hash) {
            return;
        }

        link.addEventListener('click', (event) => {
            if (!smoothScrollToHash(targetUrl.hash)) {
                return;
            }

            event.preventDefault();
        });
    });

    const handleInitialHashScroll = () => {
        requestAnimationFrame(() => {
            updateHeaderOffset();
            smoothScrollToHash(window.location.hash, false);
        });
    };

    if (window.location.hash) {
        if (document.readyState === 'complete') {
            handleInitialHashScroll();
        } else {
            window.addEventListener('load', handleInitialHashScroll, { once: true });
        }
    }

    const contactForm = document.getElementById('contactForm');
    const contactEmail = 'ridwan.wicaksono@ugm.ac.id';

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
            smoothScrollToElement(dynamicBanner);
        });
    });
});