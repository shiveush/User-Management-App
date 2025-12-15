(function ($) {
    "use strict";

    // ==========================
    // Render backend URL
    // ==========================
    const API = 'https://user-management-app-dres.onrender.com';

    /*==================================================================
    [ Focus Inputs ]*/
    $('.input100').each(function(){
        $(this).on('blur', function(){
            if($(this).val().trim() != "") {
                $(this).addClass('has-val');
            } else {
                $(this).removeClass('has-val');
            }
        });    
    });

    /*==================================================================
    [ Validate Forms ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit', function(e){
        e.preventDefault();
        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }

        if(!check) return;

        const formId = $(this).attr('id');
        if(formId === 'loginForm') loginHandler();
        if(formId === 'registerForm') registerHandler();
    });

    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        } else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();
        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();
        $(thisAlert).removeClass('alert-validate');
    }

    /*==================================================================
    [ Login Handler ]*/
    async function loginHandler() {
        const email = $('#loginEmail').val();
        const password = $('#loginPassword').val();

        try {
            const res = await fetch(`${API}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if(res.ok) {
                alert(`Login successful! Welcome ${data.user.name}`);
                loadUsers();
            } else {
                alert(data.message);
            }
        } catch(err) {
            alert('Failed to connect to backend');
            console.error(err);
        }
    }

    /*==================================================================
    [ Register Handler ]*/
    async function registerHandler() {
        const name = $('#registerName').val();
        const email = $('#registerEmail').val();
        const password = $('#registerPassword').val();

        try {
            const res = await fetch(`${API}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if(res.ok) {
                alert('Registration successful!');
            } else {
                alert(data.message);
            }
        } catch(err) {
            alert('Failed to connect to backend');
            console.error(err);
        }
    }

    /*==================================================================
    [ Load Users ]*/
    async function loadUsers() {
        try {
            const res = await fetch(`${API}/users`);
            const users = await res.json();
            const userList = $('#userList'); 
            userList.empty();
            users.forEach(u => {
                userList.append(`
                    <li>
                        ${u.name} (${u.email})
                        <button class="deleteUserBtn" data-id="${u.id}">Delete</button>
                    </li>
                `);
            });
            $('.deleteUserBtn').click(deleteUserHandler);
        } catch(err) {
            console.error('Failed to load users', err);
        }
    }

    /*==================================================================
    [ Delete User Handler ]*/
    async function deleteUserHandler() {
        const id = $(this).data('id');
        if(!confirm('Are you sure you want to delete this user?')) return;

        try {
            const res = await fetch(`${API}/users/${id}`, { method: 'DELETE' });
            const data = await res.json();
            alert(data.message);
            loadUsers();
        } catch(err) {
            alert('Failed to connect to backend');
            console.error(err);
        }
    }

    /*==================================================================
    [ Add User Handler ]*/
    $('#addUserForm').on('submit', async function(e){
        e.preventDefault();
        const name = $('#addUserName').val();
        const email = $('#addUserEmail').val();

        try {
            const res = await fetch(`${API}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });
            const data = await res.json();
            if(res.ok) {
                alert(data.message);
                loadUsers();
                $('#addUserForm')[0].reset();
            } else {
                alert(data.message);
            }
        } catch(err) {
            alert('Failed to connect to backend');
            console.error(err);
        }
    });

    // Initial load
    $(document).ready(() => {
        loadUsers();
    });

})(jQuery);
