var toggle = document.getElementById('cartCardToggle');
toggle.addEventListener('click', () => {
    var box = document.querySelector('#toggleCard');
    if (box.classList.contains('show')) {
        box.classList.remove('show');
    } else {
        box.classList.add('show');
    }
});

// ======preloader=======
setTimeout(function() {
        document.getElementById("spinner").style.display = "none";
    }, 3000)
    // =============home slider===========
$('.banner-slider').owlCarousel({
        loop: true,
        autoplay: true,
        dots: false,
        autoplayTimeout: 5000,
        nav: false,
        margin: 10,
        responsiveClass: true,
        responsive: {
            0: {
                items: 1,
                nav: false
            },
            600: {
                items: 1,
                nav: false
            },
            1000: {
                items: 1,
            }
        }
    })
    // =============latest product slider===========
$('.ls-product-slider').owlCarousel({
    loop: true,
    autoplay: true,
    dots: false,
    autoplayTimeout: 8000,
    nav: true,
    margin: 10,
    responsiveClass: true,
    responsive: {
        0: {
            items: 1,
            nav: false
        },
        600: {
            items: 1,
            nav: false
        },
        1000: {
            items: 1,
        }
    }
})

// =============blog latest post slider===========
$('.slide-ls-post').owlCarousel({
    loop: true,
    autoplay: true,
    dots: false,
    autoplayTimeout: 8000,
    nav: false,
    margin: 10,
    responsiveClass: true,
    responsive: {
        0: {
            items: 1,
            nav: false
        },
        600: {
            items: 1,
            nav: false
        },
        1000: {
            items: 1,
        }
    }
});


// =============category slider===========
$('.most-popular-category').owlCarousel({
    loop: true,
    autoplay: false,
    dots: false,
    autoplayTimeout: 8000,
    nav: true,
    margin: 20,
    responsiveClass: true,
    responsive: {
        0: {
            items: 3,
        },
        600: {
            items: 4,
        },
        1000: {
            items: 4,
        },
        1300: {
            items: 6,
        }
    }
});

// =============best sell slider===========
$('.best-sell-slider-item').owlCarousel({
    loop: true,
    autoplay: false,
    dots: false,
    autoplayTimeout: 5000,
    nav: true,
    margin: 0,
    responsiveClass: true,
    responsive: {
        0: {
            items: 1,
        },
        600: {
            items: 3,
        },
        1000: {
            items: 4,
        },
        1300: {
            items: 5,
        }
    }
});


// =============most popular slider===========
$('.most-popular-pd-sl').owlCarousel({
    loop: true,
    autoplay: false,
    dots: false,
    autoplayTimeout: 6000,
    nav: true,
    margin: 0,
    responsiveClass: true,
    responsive: {
        0: {
            items: 1,
        },
        600: {
            items: 3,
        },
        1000: {
            items: 4,
        },
        1300: {
            items: 5,
        }
    }
});


// =============trending product slider===========
$('.trending-product-sl').owlCarousel({
    loop: true,
    autoplay: false,
    dots: false,
    autoplayTimeout: 7000,
    nav: true,
    margin: 0,
    responsiveClass: true,
    responsive: {
        0: {
            items: 1,
        },
        600: {
            items: 3,
        },
        1000: {
            items: 4,
        },
        1300: {
            items: 5,
        }
    }
});


// =============category slider===========
$('.partner-slider').owlCarousel({
    loop: true,
    autoplay: false,
    dots: false,
    autoplayTimeout: 5000,
    nav: false,
    margin: 10,
    responsiveClass: true,
    responsive: {
        0: {
            items: 2,
        },
        600: {
            items: 4,
        },
        1000: {
            items: 5,
        },
        1500: {
            items: 7,
        }
    }
});

// FOR NAVBAR FIXED WHEN SCROLL
$(window).on("scroll", function() {
    var scrolling = $(this).scrollTop();
    if (scrolling > 50) {
        $(".main-header").addClass("navbar-fixed");
    } else {
        $(".main-header").removeClass("navbar-fixed");
    }
});


// $(window).scroll(function() {
//     var sticky = $('.main-header'),
//         scroll = $(window).scrollTop();

//     if (scroll >= 100) {
//         sticky.addClass('fixed-main-nav');
//         $('.top-head').addClass('d-none');
//     } else {
//         sticky.removeClass('fixed-main-nav');
//         $('.top-head').removeClass('d-none');
//     }
// });
// ======category menu toggle =======
$('#category-parent').on('click', function(e) {
    $('.category-top-menu').toggleClass("active"); //you can list several class names 
    e.preventDefault();
});
// ============mobile menu active=========
$(document).on('click', '.menus li', function() {
    $(this).addClass('active-icon').siblings().removeClass('active-icon');
})


// ============== category dropdown menu ========
$(function() {
    $('#category-list li').on('click', function() {
        $(this).toggleClass('active');
    })
});

// ============================================================PRICING RANGE SCRIPT============
$(function() {
    $("#slider-range").slider({
        range: true,
        min: 0,
        max: 1000,
        values: [10, 800],
        slide: function(event, ui) {
            $("#amount").html("$" + ui.values[0] + " - $" + ui.values[1]);
            $("#amount1").val(ui.values[0]);
            $("#amount2").val(ui.values[1]);
        }
    });
    $("#amount").html("$" + $("#slider-range").slider("values", 0) +
        " - $" + $("#slider-range").slider("values", 1));
});


// ============select box js=============
var x, i, j, l, ll, selElmnt, a, b, c;
/*look for any elements with the class "custom-select":*/
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];
    ll = selElmnt.length;
    /*for each element, create a new DIV that will act as the selected item:*/
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);
    /*for each element, create a new DIV that will contain the option list:*/
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");
    for (j = 1; j < ll; j++) {
        /*for each option in the original select element,
        create a new DIV that will act as an option item:*/
        c = document.createElement("DIV");
        c.innerHTML = selElmnt.options[j].innerHTML;
        c.addEventListener("click", function(e) {
            /*when an item is clicked, update the original select box,
            and the selected item:*/
            var y, i, k, s, h, sl, yl;
            s = this.parentNode.parentNode.getElementsByTagName("select")[0];
            sl = s.length;
            h = this.parentNode.previousSibling;
            for (i = 0; i < sl; i++) {
                if (s.options[i].innerHTML == this.innerHTML) {
                    s.selectedIndex = i;
                    h.innerHTML = this.innerHTML;
                    y = this.parentNode.getElementsByClassName("same-as-selected");
                    yl = y.length;
                    for (k = 0; k < yl; k++) {
                        y[k].removeAttribute("class");
                    }
                    this.setAttribute("class", "same-as-selected");
                    break;
                }
            }
            h.click();
        });
        b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener("click", function(e) {
        /*when the select box is clicked, close any other select boxes,
        and open/close the current select box:*/
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
    });
}

function closeAllSelect(elmnt) {
    /*a function that will close all select boxes in the document,
    except the current select box:*/
    var x, y, i, xl, yl, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    xl = x.length;
    yl = y.length;
    for (i = 0; i < yl; i++) {
        if (elmnt == y[i]) {
            arrNo.push(i)
        } else {
            y[i].classList.remove("select-arrow-active");
        }
    }
    for (i = 0; i < xl; i++) {
        if (arrNo.indexOf(i)) {
            x[i].classList.add("select-hide");
        }
    }
}
/*if the user clicks anywhere outside the select box,
then close all select boxes:*/
document.addEventListener("click", closeAllSelect);
// =============select box js end ==============


// ===========filter toggle==============
$("#filter-btn").click(function() {
    $("#filter-menu").addClass("active");
    $("#hidden-div").addClass("active");
});
$("#hidden-div").click(function() {
    $("#filter-menu").removeClass("active");
    $("#hidden-div").removeClass("active");
});
// ========product zoom=======
/* wait for images to load */
$(window).on('load', function() {
    $('.sp-wrap').smoothproducts();
});
//   ================filter toggle end========

// quantity=========input=============
jQuery(document).ready(($) => {
    $('.quantity').on('click', '.plus', function(e) {
        let $input = $(this).prev('input.qty');
        let val = parseInt($input.val());
        $input.val(val + 1).change();
    });

    $('.quantity').on('click', '.minus',
        function(e) {
            let $input = $(this).next('input.qty');
            var val = parseInt($input.val());
            if (val > 0) {
                $input.val(val - 1).change();
            }
        });
});
// =============subscription model =======



var myModal = new bootstrap.Modal(document.getElementById("subscribeModel"));
setTimeout(function() {
    myModal.show();
}, 20000);