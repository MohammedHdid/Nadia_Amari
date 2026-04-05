/* ═══════════════════════════════════════════════════════
   نادية الأماري — جافاسكربت الصفحة
   التنقل، التمرير، الكاروسيل، العدادات، الحركات
   RTL-aware
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── تأثير التمرير على شريط التنقل ───
  const nav = document.getElementById('main-nav');
  const handleNavScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // ─── القائمة المتنقلة ───
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('is-active');
    navMenu.classList.toggle('is-open');
  });

  navMenu.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('is-active');
      navMenu.classList.remove('is-open');
    });
  });


  // ─── حركات التمرير (Intersection Observer) ───
  const animatedElements = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = entry.target.parentElement.querySelectorAll('[data-animate]');
        const siblingIndex = Array.from(siblings).indexOf(entry.target);
        entry.target.style.transitionDelay = `${siblingIndex * 100}ms`;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px 0px -80px 0px', threshold: 0.1 });

  animatedElements.forEach(el => observer.observe(el));


  // ─── تحريك العدّادات ───
  const statNumbers = document.querySelectorAll('.hero__stat-number[data-target]');
  let countersAnimated = false;

  const animateCounters = () => {
    if (countersAnimated) return;
    countersAnimated = true;

    statNumbers.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const duration = 2000;
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);

        // Use Arabic-Indic numerals
        counter.textContent = current.toLocaleString('ar-SA');

        if (progress < 1) requestAnimationFrame(updateCounter);
      };
      requestAnimationFrame(updateCounter);
    });
  };

  const statsSection = document.querySelector('.hero__stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(animateCounters, 500);
        statsObserver.disconnect();
      }
    }, { threshold: 0.5 });
    statsObserver.observe(statsSection);
  }


  // ─── كاروسيل آراء العملاء (RTL-aware) ───
  const track = document.querySelector('.testimonials__track');
  const cards = document.querySelectorAll('.testimonials__card');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  const dotsContainer = document.getElementById('testimonial-dots');
  let currentSlide = 0;
  const totalSlides = cards.length;
  let autoplayInterval;

  // إنشاء النقاط
  cards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('testimonials__dot');
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.testimonials__dot');

  const goToSlide = (index) => {
    currentSlide = index;
    // RTL: positive translateX to go "forward"
    track.style.transform = `translateX(${currentSlide * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === currentSlide));
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % totalSlides);
  const prevSlide = () => goToSlide((currentSlide - 1 + totalSlides) % totalSlides);

  prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
  nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });

  // دعم اللمس/السحب
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      // RTL: swipe left = prev, swipe right = next (reversed)
      if (diff > 0) { prevSlide(); } else { nextSlide(); }
      resetAutoplay();
    }
  }, { passive: true });

  // التشغيل التلقائي
  const startAutoplay = () => { autoplayInterval = setInterval(nextSlide, 5000); };
  const resetAutoplay = () => { clearInterval(autoplayInterval); startAutoplay(); };
  startAutoplay();


  // ─── زر العودة للأعلى ───
  const backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('is-visible', window.scrollY > 600);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  // ─── التمرير السلس مع الإزاحة ───
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      e.preventDefault();
      const navHeight = nav.offsetHeight;
      const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - navHeight - 20;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });


  // ─── تأثير المنظر العميق البسيط على القسم الرئيسي ───
  const bgImage = document.querySelector('.hero__bg-image');
  const heroCircles = document.querySelectorAll('.hero__circle');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled > window.innerHeight) return;

    // Subtle parallax on the bg photo
    if (bgImage) {
      bgImage.style.transform = `translateY(${scrolled * 0.15}px) scale(1.05)`;
    }

    heroCircles.forEach((circle, i) => {
      const speed = 0.08 + (i * 0.04);
      circle.style.transform = `translateY(${scrolled * speed}px)`;
    });
  }, { passive: true });

  // Initial scale for bg image
  if (bgImage) {
    bgImage.style.transform = 'scale(1.05)';
  }

});
