// ========== تعريف المتغيرات الأساسية ==========
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
let currentUser = null;
let isLoggingIn = false;
let isLoggingOut = false;
let isSubmittingOrder = false;
let loginAlertTimeoutId = null;

// ========== إدارة الوضع الليلي ==========
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        }
    });
}

// ========== إدارة النوافذ المنبثقة ==========
function openModal() {
    document.getElementById('serviceModal').style.display = 'flex';
}

function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('serviceModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';

        // إعادة تعيين الحقول
        const usernameEl = document.getElementById('loginUsername');
        const passwordEl = document.getElementById('loginPassword');
        if (usernameEl) usernameEl.value = '';
        if (passwordEl) {
            passwordEl.value = '';
            passwordEl.type = 'password';
        }

        // إعادة أيقونة زر إظهار كلمة المرور
        const toggleIcon = document.querySelector('.toggle-password i');
        if (toggleIcon) {
            toggleIcon.className = 'fas fa-eye';
        }
    }

    // إذا كان هناك مؤقت رسالة تسجيل الدخول، ألغِه عند إغلاق النافذة
    if (loginAlertTimeoutId) {
        clearTimeout(loginAlertTimeoutId);
        loginAlertTimeoutId = null;
        isLoggingIn = false;
    }
}

// ========== نظام تسجيل الدخول البسيط ==========
function showToast(message, options = {}) {
    const { key = null, persist = 'session', type = 'success', duration = 4000 } = options;

    if (key) {
        const storage = (persist === 'local') ? localStorage : sessionStorage;
        if (storage.getItem('toast_' + key)) return;
        storage.setItem('toast_' + key, '1');
    }

    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-message">${message}</span>`;

    container.appendChild(toast);

    // show animation
    requestAnimationFrame(() => toast.classList.add('show'));

    // auto remove
    const hide = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
    };

    setTimeout(hide, duration);

    // click to dismiss
    toast.addEventListener('click', hide);
    return toast;
}

function handleLogin(e) {
    // منع الضغط المتعدد
    if (isLoggingIn) return;
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    isLoggingIn = true;

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    // التحقق من الحقول الفارغة
    if (!username || !password) {
        alert('⚠️ يرجى إدخال جميع البيانات');
        isLoggingIn = false;
        return;
    }

    // حفظ اسم المستخدم
    currentUser = username;
    localStorage.setItem('currentUser', username);
    
    // إغلاق النافذة
    closeLoginModal();
    
    // تحديث الواجهة
    updateAuthUI();
    
    // رسالة تأكيد واحدة فقط
    loginAlertTimeoutId = setTimeout(() => {
        alert(`✅ مرحباً ${username}!\nتم تسجيل دخولك بنجاح`);
        isLoggingIn = false;
        loginAlertTimeoutId = null;
    }, 300);
}

function updateAuthUI() {
    const authSection = document.getElementById('authSection');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
        currentUser = savedUser;
        authSection.innerHTML = `
            <div class="user-info">
                <span>مرحباً، ${currentUser}</span>
                <span class="logout-link" onclick="logout()">خروج</span>
            </div>
        `;
    } else {
        authSection.innerHTML = `<a href="#" class="login-btn" onclick="openLoginModal()">تسجيل الدخول</a>`;
    }
}

function logout() {
    if (isLoggingOut) return;
    if (confirm('هل تريد تسجيل الخروج؟')) {
        isLoggingOut = true;
        // إلغاء أي مؤقت لرسالة تسجيل الدخول إن وُجد
        if (loginAlertTimeoutId) {
            clearTimeout(loginAlertTimeoutId);
            loginAlertTimeoutId = null;
            isLoggingIn = false;
        }
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateAuthUI();

        setTimeout(() => {
            alert('✅ تم تسجيل الخروج بنجاح');
            isLoggingOut = false;
        }, 300);
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('loginPassword');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

// ========== بيانات المحافظات ==========
const syriaData = {
    "دمشق": ["الزبداني", "داريا", "دوما", "التل", "يبرود"],
    "حلب": ["منبج", "اعزاز", "الباب", "جرابلس"],
    "حمص": ["تدمر", "القصير", "الرستن"],
    "حماة": ["سلمية", "مصياف", "السقيلبية"],
    "اللاذقية": ["جبلة", "القرداحة"],
    "طرطوس": ["بانياس", "صافيتا"],
    "إدلب": ["معرة مصرين", "معرة النعمان", "جسر الشغور"],
    "درعا": ["إزرع", "الصنمين"],
    "السويداء": ["صلخد", "شهبا"],
    "القنيطرة": ["خان أرنبة"],
    "دير الزور": ["دير الزور", "الميادين", "البوكمال"],
    "الرقة": ["تل أبيض"],
    "الحسكة": ["القامشلي", "رأس العين", "المالكية"]
};

function loadGovernorates() {
    const pickupGov = document.getElementById('pickupGov');
    const deliveryGov = document.getElementById('deliveryGov');
    
    pickupGov.innerHTML = '<option value="">-- اختر المحافظة --</option>';
    deliveryGov.innerHTML = '<option value="">-- اختر المحافظة --</option>';
    
    for (let gov in syriaData) {
        pickupGov.add(new Option(gov, gov));
        deliveryGov.add(new Option(gov, gov));
    }
}

function updatePickupCities() {
    const gov = document.getElementById('pickupGov').value;
    const citySelect = document.getElementById('pickupCity');
    citySelect.innerHTML = '<option value="">-- اختر المدينة --</option>';
    citySelect.disabled = !gov;
    
    if (gov && syriaData[gov]) {
        syriaData[gov].forEach(city => {
            citySelect.add(new Option(city, city));
        });
        citySelect.disabled = false;
    }
}

function updateDeliveryCities() {
    const gov = document.getElementById('deliveryGov').value;
    const citySelect = document.getElementById('deliveryCity');
    citySelect.innerHTML = '<option value="">-- اختر المدينة --</option>';
    citySelect.disabled = !gov;
    
    if (gov && syriaData[gov]) {
        syriaData[gov].forEach(city => {
            citySelect.add(new Option(city, city));
        });
        citySelect.disabled = false;
    }
}

function toggleLocation(show) {
    const field = document.getElementById("locationField");
    if (show) {
        field.style.display = "block";
    } else {
        field.style.display = "none";
    }
}

// ========== إدارة رقم الواتساب الديناميكي ==========
function getWhatsAppNumber() {
    // الرقم من رابط "اتصل بنا" في الفوتر
    return '+9647836207596';
}

function updateWhatsAppNumber(newNumber) {
    // تحديث جميع روابط الواتساب في الصفحة
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
        const currentHref = link.href;
        const newHref = currentHref.replace(/wa\.me\/\d+/, `wa.me/${newNumber}`);
        link.href = newHref;
    });
    return newNumber;
}

// ========== نظام طلب الخدمة مع ربط بالواتساب ==========
function handleSubmitOrder(e) {
    e.preventDefault();
    
    // منع الإرسال المتعدد
    if (isSubmittingOrder) return;
    isSubmittingOrder = true;
    
    // جمع البيانات من النموذج
    const pickupGov = document.getElementById('pickupGov').value;
    const pickupCity = document.getElementById('pickupCity').value;
    const deliveryGov = document.getElementById('deliveryGov').value;
    const deliveryCity = document.getElementById('deliveryCity').value;
    const deliveryType = document.querySelector('input[name="deliveryType"]:checked')?.value;
    const clientLocation = document.getElementById('clientLocation')?.value || 'غير محدد';
    const whatsapp = document.getElementById('whatsapp').value.trim();
    
    // التحقق من صحة رقم الهاتف
    const whatsappPattern = /^09\d{8}$/;
    if (!whatsappPattern.test(whatsapp)) {
        alert('⚠️ يرجى إدخال رقم هاتف صحيح يبدأ بـ 09 ويتكون من 10 أرقام');
        isSubmittingOrder = false;
        return;
    }
    
    // التحقق من اكتمال البيانات
    if (!pickupGov || !pickupCity || !deliveryGov || !deliveryCity || !deliveryType) {
        alert('⚠️ يرجى ملء جميع الحقول المطلوبة');
        isSubmittingOrder = false;
        return;
    }
    
    // إنشاء رسالة مفصلة للواتساب
    const message = `📦 **طلب خدمة شحن جديد** 📦

🚚 **شركة AKOO للشحن والنقل الداخلي**

📋 **تفاصيل الطلب:**
📍 مركز الاستلام: ${pickupGov} - ${pickupCity}
📍 مركز التسليم: ${deliveryGov} - ${deliveryCity}
🚚 طريقة التسليم: ${deliveryType === 'client' ? 'إنت توصل الطلب' : 'نحنا نأتي إليك'}
${deliveryType === 'company' ? `📍 العنوان: ${clientLocation}` : ''}

👤 **معلومات العميل:**
📞 رقم الواتساب: ${whatsapp}

⏰ **معلومات الوقت:**
📅 التاريخ: ${new Date().toLocaleDateString('ar-SY')}
🕒 الوقت: ${new Date().toLocaleTimeString('ar-SY')}

---
تم إنشاء الطلب تلقائياً من الموقع الإلكتروني`;

    // الحصول على رقم الواتساب
    const whatsappNumber = getWhatsAppNumber();
    
    // ترميز الرسالة للنقل عبر URL
    const encodedMessage = encodeURIComponent(message);
    
    // إغلاق النافذة
    closeModal();
    
    // إنشاء رابط الواتساب
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // فتح الواتساب في نافذة جديدة بعد تأكيد
    setTimeout(() => {
        if (confirm('✅ تم إنشاء طلبك بنجاح!\n\nسيتم فتح الواتساب الآن لإرسال تفاصيل الطلب مباشرة إلى الشركة.\n\nهل تريد المتابعة؟')) {
            window.open(whatsappURL, '_blank');
        } else {
            // عرض البيانات للمستخدم ليتمكن من نسخها
            alert(`📋 يمكنك نسخ هذه البيانات وإرسالها يدوياً:\n\n${message}\n\nرقم الواتساب: ${whatsappNumber}`);
        }
        
        // إعادة تعيين النموذج
        document.getElementById('shippingForm').reset();
        document.getElementById('pickupCity').disabled = true;
        document.getElementById('deliveryCity').disabled = true;
        document.getElementById('locationField').style.display = 'none';
        
        isSubmittingOrder = false;
    }, 300);
}

// ========== التمرير السلس ==========
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href !== '#') {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ========== إغلاق النوافذ بالضغط خارجها ==========
window.onclick = function(event) {
    if (event.target === document.getElementById('serviceModal')) {
        closeModal();
    }
    if (event.target === document.getElementById('loginModal')) {
        closeLoginModal();
    }
}

// ========== دالة اختبار رابط الواتساب ==========
function testWhatsAppLink() {
    const testMessage = encodeURIComponent('🔧 هذا اختبار لرابط الواتساب من موقع AKOO\n\nالوقت: ' + new Date().toLocaleString('ar-SY'));
    const whatsappNumber = getWhatsAppNumber();
    window.open(`https://wa.me/${whatsappNumber}?text=${testMessage}`, '_blank');
}

// ========== دالة لعرض رسالة نجاح ==========
function showSuccessMessage(message) {
    // التحقق من عدم وجود رسالة سابقة
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // إنشاء عنصر الرسالة
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(90deg, #4CAF50, #45a049);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        font-family: 'Tajawal', sans-serif;
        font-weight: bold;
        max-width: 400px;
        text-align: right;
    `;
    
    document.body.appendChild(messageDiv);
    
    // إزالة الرسالة بعد 3 ثواني
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (messageDiv.parentNode) messageDiv.remove();
            }, 300);
        }
    }, 3000);
}

// ========== نظام الثلج ==========
let snowInterval = null;
let snowContainer = null;

function createSnowContainer() {
    if (snowContainer) return;

    snowContainer = document.createElement("div");
    snowContainer.id = "loginSnowContainer";

    // تنسيق كامل من JS
    Object.assign(snowContainer.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: "9999",
        overflow: "hidden"
    });

    document.body.appendChild(snowContainer);
}

function startLoginSnow() {
    createSnowContainer();

    if (snowInterval) return;

    snowInterval = setInterval(() => {
        const snow = document.createElement("div");
        snow.innerHTML = "❄";

        const size = Math.random() * 8 + 15;
        const startX = Math.random() * window.innerWidth;
        const duration = Math.random() * 2 + 2;
        const drift = Math.random() * 40 - 20;

        Object.assign(snow.style, {
            position: "absolute",
            top: "-30px",
            left: startX + "px",
            fontSize: size + "px",
            opacity: Math.random() * 0.5 + 0.5,
            color: "#ffffff",
            transform: "translateY(0)",
            transition: `transform ${duration}s linear`
        });

        snowContainer.appendChild(snow);

        // تحريك السقوط
        requestAnimationFrame(() => {
            snow.style.transform =
                `translateY(${window.innerHeight + 60}px) translateX(${drift}px)`;
        });

        // إزالة
        setTimeout(() => {
            snow.remove();
        }, duration * 1000);

    }, 60);
}

function stopLoginSnow() {
    clearInterval(snowInterval);
    snowInterval = null;

    if (snowContainer) {
        snowContainer.innerHTML = "";
    }
}

// تحديث دالة فتح نافذة تسجيل الدخول لإضافة الثلج
const originalOpenLoginModal = openLoginModal;
openLoginModal = function() {
    originalOpenLoginModal();
    startLoginSnow();
};

// تحديث دالة إغلاق نافذة تسجيل الدخول لإزالة الثلج
const originalCloseLoginModal = closeLoginModal;
closeLoginModal = function() {
    originalCloseLoginModal();
    stopLoginSnow();
};

// ========== منع إرسال النموذج بالزر Enter ==========
document.addEventListener('keydown', function(e) {
    const loginModal = document.getElementById('loginModal');
    const serviceModal = document.getElementById('serviceModal');
    
    if (e.key === 'Enter') {
        if (loginModal && loginModal.style.display === 'flex') {
            // منع إرسال النموذج بالزر Enter في تسجيل الدخول
            e.preventDefault();
            handleLogin();
        } else if (serviceModal && serviceModal.style.display === 'flex') {
            // السماح بالـ Enter في نموذج الخدمة (للتحرك بين الحقول)
            // لكن منع إرسال النموذج إلا بالزر
        }
    }
});

// ========== تهيئة الصفحة ==========
document.addEventListener('DOMContentLoaded', () => {
    // تهيئة الوضع الليلي
    initTheme();

    // تحميل بيانات المحافظات
    loadGovernorates();

    // إضافة مستمع حدث لنموذج الشحن (مرة واحدة فقط)
    const shippingForm = document.getElementById('shippingForm');
    if (shippingForm && !shippingForm.dataset.listenerAdded) {
        shippingForm.addEventListener('submit', handleSubmitOrder);
        shippingForm.dataset.listenerAdded = 'true';
    }

    // إضافة مستمع حدث لنموذج تسجيل الدخول (مرة واحدة فقط)
    const loginForm = document.getElementById('loginForm');
    if (loginForm && !loginForm.dataset.listenerAdded) {
        loginForm.addEventListener('submit', handleLogin);
        loginForm.dataset.listenerAdded = 'true';
    }

    // تحديث واجهة تسجيل الدخول
    updateAuthUI();

    // تهيئة التمرير السلس
    initSmoothScroll();

    // تحميل الأنيميشن لرسائل النجاح
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // إضافة حاوية الإشعارات إذا لم تكن موجودة
    if (!document.getElementById('toastContainer')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
});

// ========== تصدير الدوال للاستخدام العام ==========
window.openModal = openModal;
window.closeModal = closeModal;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.handleLogin = handleLogin;
window.logout = logout;
window.togglePasswordVisibility = togglePasswordVisibility;
window.updatePickupCities = updatePickupCities;
window.updateDeliveryCities = updateDeliveryCities;
window.toggleLocation = toggleLocation;
window.handleSubmitOrder = handleSubmitOrder;
window.testWhatsAppLink = testWhatsAppLink;
window.updateWhatsAppNumber = updateWhatsAppNumber;
window.getWhatsAppNumber = getWhatsAppNumber;

