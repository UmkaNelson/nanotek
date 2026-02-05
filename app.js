// ===== ГЛОБАЛЬНЫЙ ФАЙЛ APP.JS =====

// Защита от спама
let lastFormSubmit = 0;
const MIN_SUBMIT_INTERVAL = 30000; // 30 секунд

function checkSpamProtection() {
  const now = Date.now();
  if (now - lastFormSubmit < MIN_SUBMIT_INTERVAL) {
    alert('Пожалуйста, подождите 30 секунд перед повторной отправкой.');
    return false;
  }
  lastFormSubmit = now;
  return true;
}

// Санитизация ввода
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Предзагрузка критических изображений
function preloadCriticalImages() {
  console.log('🖼️ Предзагрузка изображений...');

  const images = [
    './images/logo-main.png',
    './images/pick1.jpg',
    './images/pick2.jpg',
    './images/pick3.jpg'
  ];

  images.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

// Мобильное меню
function initMobileMenu() {
  const menuBtn = document.querySelector('.menu-btn');
  const navMenu = document.querySelector('.nav-menu');

  if (!menuBtn || !navMenu) return;

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navMenu.classList.toggle('active');
    menuBtn.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      menuBtn.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
      navMenu.classList.remove('active');
      menuBtn.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// Плавная прокрутка к секциям
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      if (href === '#privacy-modal' || href === '#') return;

      e.preventDefault();

      const targetElement = document.querySelector(href);
      if (!targetElement) return;

      const headerHeight = document.querySelector('.header').offsetHeight;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });
}

// Валидация телефона
function validatePhone(phone) {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/.test(phone);
}

// Форматирование телефона
function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return '+7 (' + cleaned.slice(1, 4) + ') ' + cleaned.slice(4, 7) + '-' + cleaned.slice(7, 9) + '-' + cleaned.slice(9);
  }
  return phone;
}

// Формa обратной связи
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const phoneInput = form.querySelector('input[name="phone"]');

  if (phoneInput) {
    phoneInput.addEventListener('input', function() {
      let value = this.value.replace(/\D/g, '');

      if (value.length > 0) {
        if (!value.startsWith('7') && !value.startsWith('8')) {
          value = '7' + value;
        }

        let formatted = '+7 ';

        if (value.length > 1) {
          formatted += '(' + value.substring(1, 4);
        }
        if (value.length >= 4) {
          formatted += ') ' + value.substring(4, 7);
        }
        if (value.length >= 7) {
          formatted += '-' + value.substring(7, 9);
        }
        if (value.length >= 9) {
          formatted += '-' + value.substring(9, 11);
        }

        this.value = formatted;
      }
    });
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!checkSpamProtection()) return;

    const formData = new FormData(this);
    const name = sanitizeInput(formData.get('name').trim());
    const phone = sanitizeInput(formData.get('phone').trim());
    const question = sanitizeInput(formData.get('question').trim());

    let isValid = true;
    const errors = [];

    if (!name || name.length < 2) {
      errors.push('Введите корректное имя (минимум 2 символа)');
      isValid = false;
    }

    if (!validatePhone(phone)) {
      errors.push('Введите корректный номер телефона');
      isValid = false;
    }

    if (!question || question.length < 10) {
      errors.push('Введите вопрос (минимум 10 символов)');
      isValid = false;
    }

    if (!isValid) {
      alert('Пожалуйста, исправьте ошибки:\n\n' + errors.join('\n'));
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      alert('✅ Ваш вопрос успешно отправлен!\n\nМы свяжемся с вами в ближайшее время по указанному номеру телефона.');
      console.log('Отправленные данные:', { name, phone: formatPhone(phone), question });

      form.reset();
    } catch (error) {
      alert('❌ Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз или свяжитесь с нами по телефону.');
      console.error('Form submission error:', error);
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

// Модальное окно с политикой
function initPrivacyModal() {
  const modal = document.getElementById('privacy-modal');
  const closeBtn = modal?.querySelector('.modal-close');
  const acceptBtn = modal?.querySelector('.accept-btn');
  const privacyLinks = document.querySelectorAll('.privacy-link, .footer-privacy');

  if (!modal) return;

  privacyLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    modal.setAttribute('aria-hidden', 'true');
  };

  closeBtn?.addEventListener('click', closeModal);
  acceptBtn?.addEventListener('click', () => {
    closeModal();
    alert('Вы приняли политику конфиденциальности.');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// Анимации при скролле
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        if (entry.target.classList.contains('stat-block')) {
          const numberElement = entry.target.querySelector('h4');
          if (numberElement && !entry.target.classList.contains('animated')) {
            animateNumber(numberElement);
            entry.target.classList.add('animated');
          }
        }
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll('.text-image-block, .stat-block, .formula-block, .info-text, .requisites-text, .form-container, .contacts-content, .definition-list, .about-text');
  animatedElements.forEach(el => observer.observe(el));
}

// Анимация чисел
function animateNumber(element) {
  const text = element.textContent;
  const match = text.match(/\d+/);

  if (!match) return;

  const targetNumber = parseInt(match[0], 10);
  let currentNumber = 0;
  const duration = 1500;
  const increment = targetNumber / (duration / 16);

  const timer = setInterval(() => {
    currentNumber += increment;
    if (currentNumber >= targetNumber) {
      currentNumber = targetNumber;
      clearInterval(timer);
    }

    element.textContent = text.replace(match[0], Math.floor(currentNumber));
  }, 16);
}

// Адаптация при изменении размера окна
function handleResize() {
  const isMobile = window.innerWidth < 768;
  const header = document.querySelector('.header');

  if (isMobile) {
    header?.classList.add('mobile');
  } else {
    header?.classList.remove('mobile');
    const navMenu = document.querySelector('.nav-menu');
    const menuBtn = document.querySelector('.menu-btn');
    if (navMenu) navMenu.classList.remove('active');
    if (menuBtn) menuBtn.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 НАНОТЕК - Инициализация сайта');

  preloadCriticalImages();
  initMobileMenu();
  initSmoothScroll();
  initContactForm();
  initPrivacyModal();
  initScrollAnimations();

  handleResize();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 250);
  });

  document.body.classList.add('loaded');
  console.log('✅ Сайт успешно загружен');
});

window.preloadCriticalImages = preloadCriticalImages;
window.handleResize = handleResize;
