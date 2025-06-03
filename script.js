// DOM elements
const studentForm = document.getElementById('studentForm');
const rollNoInput = document.getElementById('rollNo');
const nameInput = document.getElementById('name');
const ageInput = document.getElementById('age');
const gradeInput = document.getElementById('grade');
const addBtn = document.querySelector('.add-btn');
const updateBtn = document.getElementById('updateBtn');
const resetBtn = document.getElementById('resetBtn');
const searchInput = document.getElementById('searchInput');
const filterGrade = document.getElementById('filterGrade');
const sortBy = document.getElementById('sortBy');
const studentTableBody = document.getElementById('studentTableBody');
const studentCount = document.getElementById('studentCount');
const notification = document.getElementById('notification');

// State variables
let students = JSON.parse(localStorage.getItem('students')) || [];
let editMode = false;
let currentEditId = null;
let sortField = null;
let sortDirection = 'asc';

// Initialize the app
renderStudentTable(students);
updateStudentCount();

// Event Listeners
studentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const student = {
        id: Date.now(),
        rollNo: rollNoInput.value,
        name: nameInput.value,
        age: parseInt(ageInput.value),
        grade: gradeInput.value
    };
    
    if (editMode) {
        updateStudent(currentEditId, student);
    } else {
        addStudent(student);
    }
});

resetBtn.addEventListener('click', resetForm);

searchInput.addEventListener('input', function() {
    filterStudents();
});

filterGrade.addEventListener('change', filterStudents);

sortBy.addEventListener('change', function() {
    sortStudents();
});

// Table header sorting
document.querySelectorAll('th[data-sort]').forEach(header => {
    header.addEventListener('click', function() {
        sortField = this.dataset.sort;
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        sortStudents();
        
        // Update UI to show sort direction
        document.querySelectorAll('th').forEach(th => {
            th.textContent = th.textContent.replace(' ↑', '').replace(' ↓', '');
        });
        
        this.textContent += sortDirection === 'asc' ? ' ↑' : ' ↓';
    });
});

// Functions
function addStudent(student) {
    // Check if roll number already exists
    if (students.some(s => s.rollNo === student.rollNo)) {
        showNotification('Roll number already exists!', 'error');
        return;
    }
    
    students.push(student);
    saveToLocalStorage();
    renderStudentTable(students);
    resetForm();
    showNotification('Student added successfully!', 'success');
}

function updateStudent(id, updatedStudent) {
    // Check if roll number exists for another student
    if (students.some(s => s.id !== id && s.rollNo === updatedStudent.rollNo)) {
        showNotification('Roll number already exists!', 'error');
        return;
    }
    
    students = students.map(student => 
        student.id === id ? {...updatedStudent, id} : student
    );
    
    saveToLocalStorage();
    renderStudentTable(students);
    resetForm();
    showNotification('Student updated successfully!', 'success');
}

function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        students = students.filter(student => student.id !== id);
        saveToLocalStorage();
        renderStudentTable(students);
        showNotification('Student deleted successfully!', 'info');
    }
}

function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (student) {
        rollNoInput.value = student.rollNo;
        nameInput.value = student.name;
        ageInput.value = student.age;
        gradeInput.value = student.grade;
        
        editMode = true;
        currentEditId = id;
        addBtn.style.display = 'none';
        updateBtn.style.display = 'flex';
        
        rollNoInput.focus();
    }
}

function resetForm() {
    studentForm.reset();
    editMode = false;
    currentEditId = null;
    addBtn.style.display = 'flex';
    updateBtn.style.display = 'none';
}

function filterStudents() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedGrade = filterGrade.value;
    
    let filteredStudents = students;
    
    if (searchTerm) {
        filteredStudents = filteredStudents.filter(student => 
            student.rollNo.toLowerCase().includes(searchTerm)
        );
    }
    
    if (selectedGrade) {
        filteredStudents = filteredStudents.filter(student => 
            student.grade === selectedGrade
        );
    }
    
    renderStudentTable(filteredStudents);
}

function sortStudents() {
    const sortFieldValue = sortBy.value || sortField;
    
    if (!sortFieldValue) return;
    
    students.sort((a, b) => {
        let valueA = a[sortFieldValue];
        let valueB = b[sortFieldValue];
        
        // For string comparison
        if (typeof valueA === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }
        
        if (valueA < valueB) {
            return sortDirection === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
            return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
    });
    
    renderStudentTable(students);
}

function renderStudentTable(studentsArray) {
    studentTableBody.innerHTML = '';
    
    if (studentsArray.length === 0) {
        studentTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px; color: #777;">
                    <i class="fas fa-user-graduate" style="font-size: 3rem; margin-bottom: 15px; display: block; color: #d0d0d0;"></i>
                    No student records found
                </td>
            </tr>
        `;
        updateStudentCount();
        return;
    }
    
    studentsArray.forEach(student => {
        const row = document.createElement('tr');
        
        // Determine row color based on grade
        let rowClass = '';
        if (student.grade === 'A') rowClass = 'grade-a';
        else if (student.grade === 'F') rowClass = 'grade-f';
        
        row.className = rowClass;
        
        row.innerHTML = `
            <td>${student.rollNo}</td>
            <td>${student.name}</td>
            <td>${student.age}</td>
            <td><span class="grade-badge">${student.grade}</span></td>
            <td class="action-cell">
                <button class="edit-btn" onclick="editStudent(${student.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" onclick="deleteStudent(${student.id})">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </td>
        `;
        
        studentTableBody.appendChild(row);
    });
    
    updateStudentCount();
}

function updateStudentCount() {
    studentCount.textContent = students.length;
}

function saveToLocalStorage() {
    localStorage.setItem('students', JSON.stringify(students));
    updateStudentCount();
}

function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Add sample data if empty
if (students.length === 0) {
    students = [
        {id: 1, rollNo: 'S101', name: 'Mohamed Asik', age: 23, grade: 'B'},
        {id: 2, rollNo: 'S102', name: 'Mohan Kumar', age: 24, grade: 'A'},
        {id: 3, rollNo: 'S103', name: 'Morgan Bell', age: 23, grade: 'C'},
        {id: 4, rollNo: 'S104', name: 'Saranya Sri', age: 22, grade: 'A'},
        {id: 5, rollNo: 'S105', name: 'Ajay', age: 24, grade: 'C'}
    ];
    saveToLocalStorage();
    renderStudentTable(students);
}