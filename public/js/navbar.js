

let navbar= document.querySelector('.navbar1');

    navbar.addEventListener("click", (e) => {
        if (!e.target.contains (navbar)) { 
            document.querySelector('.active-1').classList.remove( 'active-1'); 
            e.target.classList.add('active-1');
        };
        
        });


