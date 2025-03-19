// ------------ Глобальные переменные ------------
let db; // База данных
let selectedDate = new Date(); // Выбранная дата

// ------------ Функции календаря ------------
function updateDateDisplay() {
    const currentDateElement = document.getElementById('current-date');
    const currentDayElement = document.getElementById('current-day');
    
    // Форматируем дату и день недели в одну строку
    currentDateElement.textContent = selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    currentDayElement.textContent = selectedDate.toLocaleDateString('ru-RU', { weekday: 'long' });
}

function renderCalendar(date) {
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthElement = document.getElementById('current-month');
    const year = date.getFullYear();
    const month = date.getMonth();

    // Отображаем текущий месяц и год
    currentMonthElement.textContent = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(date);

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

    calendarGrid.innerHTML = '';

    // Заполняем пустые ячейки до первого дня месяца
    for (let i = 0; i < startingDay; i++) {
        calendarGrid.appendChild(document.createElement('div'));
    }

    // Заполняем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        const dayDate = new Date(year, month, day);
        dayElement.addEventListener('click', () => selectDate(dayDate));
        
        // Выделяем выбранную дату
        if (selectedDate.toDateString() === dayDate.toDateString()) {
            dayElement.classList.add('selected');
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

function changeMonth(offset) {
    selectedDate.setMonth(selectedDate.getMonth() + offset); // Изменяем месяц у выбранной даты
    renderCalendar(selectedDate); // Перерисовываем календарь
}

function selectDate(date) {
    selectedDate = date; // Обновляем выбранную дату
    updateDateDisplay(); // Обновляем отображение даты
    renderCalendar(selectedDate); // Перерисовываем календарь с новой датой
}

function changeDay(offset) {
    selectedDate.setDate(selectedDate.getDate() + offset); // Изменяем выбранную дату
    updateDateDisplay(); // Обновляем отображение даты
    renderCalendar(selectedDate); // Перерисовываем календарь с новой датой
}

function toggleCalendar() {
    const calendar = document.getElementById('calendar');
    if (calendar.style.display === 'none') {
        renderCalendar(selectedDate);
        calendar.style.display = 'block';
    } else {
        calendar.style.display = 'none';
    }
}

// Закрытие календаря при клике вне его области
document.addEventListener('click', function (event) {
    const calendar = document.getElementById('calendar');
    const datePicker = document.getElementById('date-picker');

    if (!datePicker.contains(event.target)) {
        calendar.style.display = 'none';
    }
});

// Инициализация календаря при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateDateDisplay(); // Обновляем отображение даты
    renderCalendar(selectedDate); // Рисуем календарь с текущей датой
});

// ------------ Общие функции интерфейса ------------
function toggleReadMore() {
    const hiddenText = document.getElementById('hidden-text');
    const readFullButton = document.getElementById('text1');
    const hideButton = document.getElementById('hide-button');
    const gradientOverlay = document.getElementById('gradient-overlay');

    if (hiddenText.classList.contains('open')) {
        hiddenText.classList.remove('open');
        gradientOverlay.style.opacity = '1';
        readFullButton.style.display = 'block';
        hideButton.style.display = 'none';
    } else {
        hiddenText.classList.add('open');
        gradientOverlay.style.opacity = '0';
        readFullButton.style.display = 'none';
        hideButton.style.display = 'block';
    }
}

// ------------ Функции для модального окна ------------
document.getElementById('fixed-button').addEventListener('click', function () {
    document.getElementById('modal').style.display = 'flex';
    showStep(1);
});

function showStep(step) {
    document.querySelectorAll('.step').forEach(function (stepElement) {
        stepElement.style.display = 'none';
    });

    document.getElementById(`step${step}`).style.display = 'flex';

    const backButton = document.querySelector('.back-button');
    const closeButton = document.querySelector('.close-modal');

    if (step === 1) {
        backButton.style.display = 'none';
        closeButton.style.display = 'block';
    } else if (step === 6) { // Теперь шагов стало 6
        backButton.style.display = 'none';
        closeButton.style.display = 'none';
    } else {
        backButton.style.display = 'block';
        closeButton.style.display = 'block';
    }

    updateConfirmButton();

    if (step === 5) { // Теперь шаг 5 — это ввод данных
        validateStep4();
        setupStep4Listeners();
    }

    if (step === 4) { // Теперь шаг 4 — это выбор даты и времени
        updateDateDisplay();
        renderCalendar(selectedDate);
    }
}

function nextStep() {
    const currentStep = document.querySelector('.step[style="display: flex;"]');
    if (!currentStep) return;

    const currentStepNumber = parseInt(currentStep.id.replace('step', ''));
    const nextStepNumber = currentStepNumber + 1;

    if (nextStepNumber === 6) { // Теперь шагов стало 6
        saveAppointment();
    } else {
        showStep(nextStepNumber);
    }
}

function prevStep() {
    const currentStep = document.querySelector('.step[style="display: flex;"]');
    if (currentStep) {
        const currentStepNumber = parseInt(currentStep.id.replace('step', ''));
        if (currentStepNumber > 1) {
            showStep(currentStepNumber - 1);
        }
    }
    updateConfirmButton();
}

function resetModal() {
    document.getElementById('brand').selectedIndex = 0;
    document.getElementById('model').innerHTML = '<option value="">Выберите модель</option>';
    document.getElementById('model').disabled = true;

    const servicesContainer = document.getElementById('services-container');
    servicesContainer.innerHTML = '';

    document.getElementById('total').textContent = '0₽';

    selectedDate = new Date(); // Сбрасываем дату на текущую
    updateDateDisplay(); // Обновляем отображение даты
    renderCalendar(selectedDate); // Перерисовываем календарь

    const timeSlotsContainer = document.querySelector('.time-slots');
    timeSlotsContainer.innerHTML = '';

    document.getElementById('clientName').value = '';
    document.getElementById('clientPhone').value = '';
    document.getElementById('clientCarNumber').value = '';

    document.getElementById('next1').disabled = true;
    document.getElementById('next2').disabled = true;
    document.getElementById('next3').disabled = true; // Новый шаг
    document.getElementById('next4').disabled = true; // Теперь это шаг 4
    document.getElementById('next5').disabled = true; // Теперь это шаг 5

    showStep(1);
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    resetModal();
}

// ------------ Работа с данными ------------
function populateBrands(brands) {
    const brandSelect = document.getElementById('brand');
    brandSelect.innerHTML = '<option value="">Выберите марку</option>';

    if (!brands || !Array.isArray(brands)) {
        console.error("Ошибка: brands не определен или не является массивом");
        return;
    }

    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.id;
        option.textContent = brand.name;
        brandSelect.appendChild(option);
    });
}

function populateModels(models) {
    const modelSelect = document.getElementById('model');
    modelSelect.innerHTML = '<option value="">Выберите модель</option>';
    modelSelect.disabled = true;

    if (!Array.isArray(models)) {
        console.error("Models не является массивом");
        return;
    }

    if (models.length === 0) {
        console.warn("Нет доступных моделей для выбранной марки");
        return;
    }

    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.name;
        modelSelect.appendChild(option);
    });

    modelSelect.disabled = false;
}

function populateServices(services) {
    const servicesContainer = document.getElementById('services-container');
    servicesContainer.innerHTML = '';

    if (!services || !Array.isArray(services)) {
        console.error("Ошибка: services не определен или не является массивом");
        return;
    }

    if (services.length === 0) {
        console.warn("Нет доступных услуг для выбранной модели");
        servicesContainer.innerHTML = '<p>Услуги для данного авто пока что добавляются, скоро все исправим)</p>';
        return;
    }

    services.forEach(service => {
        // Создаем контейнер для услуги
        const serviceContainer = document.createElement('div');
        serviceContainer.className = 'service-container';
        serviceContainer.style.marginBottom = '10px';

        // Создаем label для чекбокса
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" name="service" value="${service.id}" data-price="${service.price}" data-duration="${service.duration}" onchange="updateTotal()">
            ${service.name} (${service.price}₽, ${service.duration} мин)
        `;

        // Добавляем значок с вопросом
        const questionIcon = document.createElement('div');
        questionIcon.className = 'question-icon';
        questionIcon.innerHTML = '?';
        questionIcon.style.cursor = 'pointer';
        questionIcon.style.marginLeft = '10px';
        questionIcon.style.display = 'inline-block';
        questionIcon.style.width = '20px';
        questionIcon.style.height = '20px';
        questionIcon.style.borderRadius = '50%';
        questionIcon.style.backgroundColor = '#000';
        questionIcon.style.color = '#fff';
        questionIcon.style.textAlign = 'center';
        questionIcon.style.lineHeight = '20px';
        questionIcon.style.fontSize = '14px';

        // Создаем блок для описания услуги
        const description = document.createElement('div');
        description.className = 'service-description';
        description.style.display = 'none'; // Скрываем описание по умолчанию
        description.style.fontSize = '12px';
        description.style.color = '#56595a';
        description.style.marginTop = '5px';
        description.style.padding = '10px';
        description.style.backgroundColor = '#f5f5f5';
        description.style.borderRadius = '5px';

        // Описание для каждой услуги
        if (service.name === 'KCX - Euro') {
            description.innerHTML = `
                <strong>Евромойка</strong><br>
                1. Первичная обработка Multi Star.<br>
                2. Мойка колесных дисков и насадок глушителя.<br>
                3. Мойка пористой губкой и шампунем, (арки, пороги, коврики) Twin Shampoo.<br>
                4. Консервация ЛКП Magic Dry & Care.<br>
                5. Полная продувка кузова.
            `;
        } else if (service.name === 'KCX - Nano') {
            description.innerHTML = `
                <strong>Наномойка</strong><br>
                1. Первичная обработка Multi Star.<br>
                2. Мойка колесных дисков и насадок глушителя.<br>
                3. Мойка пористой губкой и шампунем, (арки, пороги, коврики) Nano Magic Shampoo.<br>
                4. Полная продувка кузова.
            `;
        } else if (service.name === 'KCX - Protector') {
            description.innerHTML = `
                <strong>Керамо-мойка</strong><br>
                1. Первичная обработка Multi Star SIO2.<br>
                2. Мойка колесных дисков и насадок глушителя.<br>
                3. Мойка пористой губкой и шампунем, (арки, пороги, коврики) ACID SHAMPOO.<br>
                4. Консервация ЛКП Protector CarWash.<br>
                5. Полная продувка кузова.
            `;
        }

        // Обработчик клика на значок с вопросом
        questionIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // Останавливаем всплытие события
            description.style.display = description.style.display === 'none' ? 'block' : 'none';
        });

        // Добавляем label, значок и описание в контейнер услуги
        serviceContainer.appendChild(label);
        serviceContainer.appendChild(questionIcon);
        serviceContainer.appendChild(description);

        // Добавляем контейнер услуги в общий контейнер услуг
        servicesContainer.appendChild(serviceContainer);
    });

    // Закрываем описание при клике вне области
    document.addEventListener('click', (event) => {
        const descriptions = document.querySelectorAll('.service-description');
        descriptions.forEach(desc => {
            if (!desc.contains(event.target) && !desc.previousElementSibling.contains(event.target)) {
                desc.style.display = 'none';
            }
        });
    });
}

function calculateTimeSlots(duration) {
    const slots = [];
    let startTime = new Date();
    startTime.setHours(9, 0, 0);

    while (startTime.getHours() < 20) {
        const endTime = new Date(startTime.getTime() + duration * 60000);
        slots.push({
            start: startTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            end: endTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        });
        startTime = endTime;
    }

    return slots;
}

function populateTimeSlots(duration) {
    const slots = calculateTimeSlots(duration);
    const timeSlotsContainer = document.querySelector('.time-slots');
    timeSlotsContainer.innerHTML = '';

    slots.forEach(slot => {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'time-slot available';
        slotDiv.textContent = `${slot.start} - ${slot.end}`;

        slotDiv.addEventListener('click', function () {
            const isSelected = this.classList.contains('selected');

            if (isSelected) {
                this.classList.remove('selected');
            } else {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                this.classList.add('selected');
            }

            updateConfirmButton();
        });

        timeSlotsContainer.appendChild(slotDiv);
    });
}

function updateTotal() {
    const selectedServices = document.querySelectorAll('input[name="service"]:checked');
    let total = 0;
    let totalDuration = 0;

    selectedServices.forEach(service => {
        total += parseInt(service.dataset.price);
        totalDuration += parseInt(service.dataset.duration);
    });

    document.getElementById('total').textContent = `${total}₽`;

    if (selectedServices.length > 0) {
        populateTimeSlots(totalDuration);
    } else {
        const timeSlotsContainer = document.querySelector('.time-slots');
        timeSlotsContainer.innerHTML = '';
    }

    updateConfirmButton();
}

// ------------ Валидация и форматирование ------------
function capitalizeInput(input) {
    input.value = input.value
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function validateName(input) {
    input.value = input.value.replace(/[^а-яА-ЯёЁ\s]/g, '');
    capitalizeInput(input);
    validateStep4();
}

function formatPhone(input) {
    let phone = input.value.replace(/\D/g, '');
    if (phone.startsWith('7') || phone.startsWith('8')) {
        phone = phone.substring(1);
    }
    if (phone.length > 10) {
        phone = phone.substring(0, 10);
    }

    let formattedPhone = '+7';
    if (phone.length > 0) {
        formattedPhone += ` (${phone.substring(0, 3)}`;
    }
    if (phone.length > 3) {
        formattedPhone += `) ${phone.substring(3, 6)}`;
    }
    if (phone.length > 6) {
        formattedPhone += `-${phone.substring(6, 8)}`;
    }
    if (phone.length > 8) {
        formattedPhone += `-${phone.substring(8, 10)}`;
    }

    input.value = formattedPhone;
    validateStep4();
}

function validateStep4() {
    const nameInput = document.getElementById('clientName');
    const phoneInput = document.getElementById('clientPhone');
    const carNumberInput = document.getElementById('clientCarNumber');
    const nextButton = document.getElementById('next4');

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const carNumber = carNumberInput.value.trim();
    const isPhoneValid = phone.length === 18;

    nextButton.disabled = !(name && isPhoneValid && carNumber);
}

function setupStep4Listeners() {
    const nameInput = document.getElementById('clientName');
    const phoneInput = document.getElementById('clientPhone');
    const carNumberInput = document.getElementById('clientCarNumber');

    nameInput.addEventListener('input', validateStep4);
    phoneInput.addEventListener('input', validateStep4);
    carNumberInput.addEventListener('input', validateStep4);
}

function updateConfirmButton() {
    const currentStep = document.querySelector('.step[style="display: flex;"]');
    if (!currentStep) return;

    const stepNumber = parseInt(currentStep.id.replace('step', ''));
    const confirmButton = document.getElementById(`next${stepNumber}`);

    switch (stepNumber) {
        case 1:
            const brandSelected = document.getElementById('brand').value;
            const modelSelected = document.getElementById('model').value;
            confirmButton.disabled = !(brandSelected && modelSelected);
            break;
        case 2:
            const servicesSelected = document.querySelectorAll('input[name="service"]:checked').length > 0;
            confirmButton.disabled = !servicesSelected;
            break;
        case 3:
            // Новый шаг "Дополнительные услуги"
            confirmButton.disabled = false; // Кнопка всегда активна на этом шаге
            break;
        case 4:
            const timeSlotSelected = document.querySelector('.time-slot.selected');
            confirmButton.disabled = !(timeSlotSelected && selectedDate);
            break;
        case 5:
            validateStep4();
            break;
        default:
            confirmButton.disabled = false;
    }
}

// ------------ Инициализация и обработчики ------------
document.getElementById('fixed-button').addEventListener('click', async function () {
    try {
        db = await dbFunctions.initDatabase();
        const brands = await dbFunctions.getBrands(db);
        populateBrands(brands);
        showStep(1);
    } catch (error) {
        console.error("Ошибка:", error);
    }
});

document.getElementById('brand').addEventListener('change', async function () {
    try {
        const brandId = this.value;
        if (!brandId) {
            document.getElementById('model').disabled = true;
            document.getElementById('next1').disabled = true;
            return;
        }

        const models = await dbFunctions.getModels(db, brandId);
        populateModels(models);
        document.getElementById('model').disabled = false;
    } catch (error) {
        console.error("Ошибка при загрузке моделей:", error);
        document.getElementById('model').disabled = true;
        document.getElementById('next1').disabled = true;
    }
});

document.getElementById('model').addEventListener('change', function () {
    const modelId = this.value;
    if (modelId) {
        document.getElementById('next1').disabled = false;
    } else {
        document.getElementById('next1').disabled = true;
    }
    updateConfirmButton();
});

document.getElementById('model').addEventListener('change', async function () {
    try {
        const modelId = this.value;
        if (!modelId) {
            return;
        }

        const services = await dbFunctions.getServices(db, modelId);
        populateServices(services);
    } catch (error) {
        console.error("Ошибка при загрузке услуг:", error);
    }
});

async function getBrandAndModelName(db, modelId) {
    try {
        const stmt = db.prepare(`
            SELECT b.name AS brandName, m.name AS modelName
            FROM models m
            JOIN brands b ON m.brand_id = b.id
            WHERE m.id = $modelId
        `);
        stmt.bind({ $modelId: modelId });
        const result = stmt.step() ? stmt.getAsObject() : null;
        stmt.free();

        return result ? `${result.brandName} ${result.modelName}` : "Неизвестная модель";
    } catch (error) {
        console.error("Ошибка при получении марки и модели:", error);
        return "Неизвестная модель";
    }
}

document.getElementById('clientPhone').addEventListener('focus', function () {
    const phoneInput = this;
    if (!phoneInput.value.startsWith('+7')) {
        phoneInput.value = '+7';
    }
});

document.getElementById('clientName').addEventListener('paste', function (event) {
    event.preventDefault();
    const pastedText = (event.clipboardData || window.clipboardData).getData('text');
    this.value = pastedText;
    capitalizeInput(this);
});

document.addEventListener('scroll', function () {
    const fixedButton = document.getElementById('fixed-button');
    const aboutSection = document.querySelector('.about-section');
    const footer = document.querySelector('.footer');

    const aboutSectionRect = aboutSection.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();

    if (aboutSectionRect.top <= window.innerHeight || footerRect.top <= window.innerHeight) {
        fixedButton.classList.add('hidden');
    } else {
        fixedButton.classList.remove('hidden');
    }
});

// ------------ Вспомогательные функции ------------
function updateTimeSlots() {
    const selectedServices = document.querySelectorAll('input[name="service"]:checked');
    let totalDuration = 0;

    selectedServices.forEach(service => {
        totalDuration += parseInt(service.dataset.duration);
    });

    if (selectedServices.length > 0) {
        populateTimeSlots(totalDuration);
    } else {
        const timeSlotsContainer = document.querySelector('.time-slots');
        timeSlotsContainer.innerHTML = '';
    }
}

// ------------ Функция для сохранения записи ------------
async function saveAppointment() {
    if (!db) {
        console.error("База данных не инициализирована");
        return;
    }

    const clientName = document.getElementById('clientName').value;
    const clientPhone = document.getElementById('clientPhone').value;
    const clientCarNumber = document.getElementById('clientCarNumber').value;

    const selectedServices = Array.from(document.querySelectorAll('input[name="service"]:checked'))
        .map(service => service.value);

    const selectedTimeSlot = document.querySelector('.time-slot.selected');
    if (!selectedTimeSlot) {
        console.error("Время не выбрано");
        return;
    }
    const [startTime, endTime] = selectedTimeSlot.textContent.split(' - ');

    const modelId = document.getElementById('model').value;

    const brandAndModelName = await getBrandAndModelName(db, modelId);

    const appointment = {
        clientName,
        clientPhone,
        carNumber: clientCarNumber,
        model: brandAndModelName,
        services: selectedServices,
        date: selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
        startTime,
        endTime,
        timestamp: new Date().toLocaleString()
    };

    try {
        await dbFunctions.saveAppointment(db, clientName, clientPhone, clientCarNumber, modelId, selectedServices, startTime, endTime);
        saveAppointmentToLocalStorage(appointment);
        console.log("Запись успешно сохранена");
        showStep(5);
    } catch (error) {
        console.error("Ошибка при сохранении записи:", error);
    }
}

function saveAppointmentToLocalStorage(appointment) {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    console.log('Запись сохранена в LocalStorage:', appointment);
}

document.querySelector('.number').addEventListener('click', function () {
    document.getElementById('phone-modal').style.display = 'flex';
});

document.querySelector('.close-phone-modal').addEventListener('click', function () {
    document.getElementById('phone-modal').style.display = 'none';
});

window.addEventListener('click', function (event) {
    const phoneModal = document.getElementById('phone-modal');
    if (event.target === phoneModal) {
        phoneModal.style.display = 'none';
    }
});

document.getElementById('copy-phone-number').addEventListener('click', function () {
    const phoneNumber = '+7 (495) 228-64-28';
    navigator.clipboard.writeText(phoneNumber).then(function () {
        alert('Номер скопирован: ' + phoneNumber);
    }).catch(function (error) {
        console.error('Ошибка при копировании: ', error);
    });
});
