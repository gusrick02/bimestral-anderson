
const API_URL = "http://0.0.0.0:80";
const routes = {
    registerPatient: `${localhost/api}/pacientes`,
    registerDoctor: `${localhost/api}/medicos`,
    loginPatient: `${localhost/api}/pacientes/login`,
    loginDoctor: `${localhost/api}/medicos/login`,
    scheduleAppointment: `${localhost/api}/consultas`,
    getAppointments: `${localhost/api}/consultas`
};

document.addEventListener("DOMContentLoaded", () => {
    const forms = document.querySelectorAll("form");
    forms.forEach(form => {
        form.addEventListener("submit", handleFormSubmit);
    });
});


async function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const isRegister = form.querySelector("button[type='submit']").innerText === "Cadastrar";

   
    const formType = document.title.includes("Paciente") ? "Patient" : "Doctor";
    const isLogin = !isRegister;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
        if (isRegister) {
        
            await handleRegister(data, formType);
        } else if (isLogin) {

            await handleLogin(data, formType);
        }
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
}


async function handleRegister(data, formType) {
    const endpoint = formType === "Patient" ? routes.registerPatient : routes.registerDoctor;

    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Erro ao cadastrar. Tente novamente.");

    alert("Cadastro realizado com sucesso!");
    window.location.href = formType === "Patient" ? "loginPaciente.html" : "loginMedico.html";
}


async function handleLogin(data, formType) {
    const endpoint = formType === "Patient" ? routes.loginPatient : routes.loginDoctor;

    const response = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Erro ao realizar login. Verifique as credenciais.");

    const userData = await response.json();
    localStorage.setItem("user", JSON.stringify(userData));


    window.location.href = formType === "Patient" ? "agendaPaciente.html" : "agendaMedico.html";
}


async function scheduleAppointment(event) {
    event.preventDefault();

    const description = document.getElementById("description").value;
    const date = document.getElementById("date").value;
    const doctor = document.getElementById("doctor").value;

    const data = { description, date, doctor };

    const response = await fetch(routes.scheduleAppointment, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Erro ao agendar consulta.");

    alert("Consulta agendada com sucesso!");
    document.getElementById("patientForm").reset();
}

async function getAppointments() {
    const user = JSON.parse(localStorage.getItem("user"));
    const doctorId = user?.id;

    if (!doctorId) return alert("ID do médico não encontrado!");

    const response = await fetch(`${routes.getAppointments}?doctorId=${doctorId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) throw new Error("Erro ao buscar consultas.");

    const appointments = await response.json();
    const appointmentsList = document.getElementById("appointmentsList");

    appointmentsList.innerHTML = "";

    if (appointments.length === 0) {
        appointmentsList.innerHTML = "<p>Sem consultas marcadas no momento.</p>";
    } else {
        appointments.forEach((appointment, index) => {
            const appointmentItem = document.createElement("div");
            appointmentItem.innerHTML = `
                <p><strong>Consulta ${index + 1}:</strong></p>
                <p>Descrição: ${appointment.description}</p>
                <p>Data: ${appointment.date}</p>
                <hr>
            `;
            appointmentsList.appendChild(appointmentItem);
        });
    }
}
