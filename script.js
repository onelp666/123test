// Глобальные переменные
let db; // База данных
let selectedDate = new Date(); // Выбранная дата

// Функции календаря
function updateDateDisplay() {
    const currentDateElement = document.getElementById('current-date');
    const currentDayElement = document.getElementById('current-day');
    currentDateElement.textContent = selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    currentDayElement.textContent = selectedDate.toLocaleDateString('ru-RU', { weekday: 'long' });
}

function renderCalendar(date) {
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthElement = document.getElementById('current-month');
    const year = date.getFullYear();
    const month = date.getMonth();

    currentMonthElement.textContent = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(date);

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

    calendarGrid.innerHTML = '';

    for (let i = 0; i < startingDay; i++) {
        calendarGrid.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        const dayDate = new Date(year, month, day);
        dayElement.addEventListener('click', () => selectDate(dayDate));

        if (selectedDate.toDateString() === dayDate.toDateString()) {
            dayElement.classList.add('selected');
        }

        calendarGrid.appendChild(dayElement);
    }
}

function selectDate(date) {
    selectedDate = date;
    updateDateDisplay();
    renderCalendar(selectedDate);
}

function changeMonth(offset) {
    selectedDate.setMonth(selectedDate.getMonth() + offset);
    renderCalendar(selectedDate);
}

function changeDay(offset) {
    selectedDate.setDate(selectedDate.getDate() + offset);
    updateDateDisplay();
    renderCalendar(selectedDate);
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

// Общие функции интерфейса
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

// Функции для модального окна
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
    } else if (step === 6) {
        backButton.style.display = 'none';
        closeButton.style.display = 'none';
    } else {
        backButton.style.display = 'block';
        closeButton.style.display = 'block';
    }

    updateConfirmButton();

    if (step === 5) {
        validateStep4();
        setupStep4Listeners();
    }

    if (step === 4) {
        updateDateDisplay();
        renderCalendar(selectedDate);
    }
}

function nextStep() {
    const currentStep = document.querySelector('.step[style="display: flex;"]');
    if (!currentStep) return;

    const currentStepNumber = parseInt(currentStep.id.replace('step', ''));
    const nextStepNumber = currentStepNumber + 1;

    if (nextStepNumber === 6) {
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

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    resetModal();
}

function resetModal() {
    document.getElementById('brand').selectedIndex = 0;
    document.getElementById('model').innerHTML = '<option value="">Выберите модель</option>';
    document.getElementById('model').disabled = true;
    document.getElementById('services-container').innerHTML = '';
    document.getElementById('total').textContent = '0₽';
    selectedDate = new Date();
    updateDateDisplay();
    renderCalendar(selectedDate);
    document.querySelector('.time-slots').innerHTML = '';
    document.getElementById('clientName').value = '';
    document.getElementById('clientPhone').value = '';
    document.getElementById('clientCarNumber').value = '';
    document.getElementById('next1').disabled = true;
    document.getElementById('next2').disabled = true;
    document.getElementById('next3').disabled = true;
    document.getElementById('next4').disabled = true;
    document.getElementById('next5').disabled = true;
    showStep(1);
}

// Работа с данными
async function populateBrands(brands) {
    const brandSelect = document.getElementById('brand');
    brandSelect.innerHTML = '<option value="">Выберите марку</option>';
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.id;
        option.textContent = brand.name;
        brandSelect.appendChild(option);
    });
}

async function populateModels(models) {
    const modelSelect = document.getElementById('model');
    modelSelect.innerHTML = '<option value="">Выберите модель</option>';
    modelSelect.disabled = true;

    if (models.length > 0) {
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            modelSelect.appendChild(option);
        });
        modelSelect.disabled = false;
    }
}

async function populateServices(services) {
    const servicesContainer = document.getElementById('services-container');
    servicesContainer.innerHTML = '';

    if (services.length > 0) {
        services.forEach(service => {
            const serviceContainer = document.createElement('div');
            serviceContainer.className = 'service-container';
            serviceContainer.style.marginBottom = '10px';

            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" name="service" value="${service.id}" data-price="${service.price}" data-duration="${service.duration}" onchange="updateTotal()">
                ${service.name} (${service.price}₽, ${service.duration} мин)
            `;

            serviceContainer.appendChild(label);
            servicesContainer.appendChild(serviceContainer);
        });
    } else {
        servicesContainer.innerHTML = '<p>Услуги для данного авто пока что добавляются, скоро все исправим)</p>';
    }
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
        document.querySelector('.time-slots').innerHTML = '';
    }

    updateConfirmButton();
}

// Валидация и форматирование
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
    const nextButton = document.getElementById('next5');

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
            confirmButton.disabled = false;
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

// Инициализация и обработчики
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

// Вспомогательные функции
function capitalizeInput(input) {
    input.value = input.value
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Функция для сохранения записи
async function saveAppointment() {
    if (!db) {
        console.error("База данных не инициализирована");
        return;
    }

    const clientName = document.getElementById('clientName').value;
    const clientPhone = document.getElementById('clientPhone').value;
    const clientCarNumber = document.getElementById('clientCarNumber').value;
    const selectedServices = Array.from(document.querySelectorAll('input[name="service"]:checked')).map(service => service.value);
    const selectedTimeSlot = document.querySelector('.time-slot.selected');

    if (!selectedTimeSlot) {
        console.error("Время не выбрано");
        return;
    }

    const [startTime, endTime] = selectedTimeSlot.textContent.split(' - ');
    const modelId = document.getElementById('model').value;

    const appointment = {
        clientName,
        clientPhone,
        carNumber: clientCarNumber,
        model: modelId,
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
        showStep(6);
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
