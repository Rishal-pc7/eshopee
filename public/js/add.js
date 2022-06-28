

	function addToCart(proId){
        let pathname=window.location.pathname
    $.ajax({
        url:"/add-to-cart/"+proId,
        method:'get',
        success: (response)=>{
            
            if(response.status){
                
                let count=$("#cart-count").html()
                let count1=$("#cart-count1").html()
                count=parseInt(count)+1
                count1=parseInt(count1)+1
                
                swal("Product Added to Cart Successfully", {
                    icon: "success",
                  }).then(()=>{
                    if(pathname==='/wishlist'){
                        
                        removeWishlistItem(proId)
                    
                    }

                  })
                $('#cart-count').html(count)
                $('#cart-count1').html(count1)
              
            }
        else {
                console.log('login')
                 swal("Please Login to Continue", {
                    icon: "warning",
                  }).then(()=>{
                    location.href='/login'
                  }
                  )
            }
            console.log(response)
        }

    })
}


function addToWishlist(proId){
    $.ajax({
        url:"/add-to-wishlist/"+proId,
        method:'get',
        success:(response)=>{
            
          if(response.status){
            swal("Product Added to Wishlist Successfully", {
                icon: "success",
              }).then(()=>{
                  location.reload()
              })
            let count=$("#wishlist-count").html()
            let count1=$("#wishlist-count1").html()
            count=parseInt(count)+1
                count1=parseInt(count1)+1
                $('#wishlist-count1').html(count1)
                $('#wishlist-count').html(count)

          }
          else {
            console.log('login')
             swal("Please Login to Continue", {
                icon: "warning",
              }).then(()=>{
                location.href='/login'
              }
              )
        }
        }

    })
}

function removeWishlistItem(proId){
    $.ajax({
        url:'/remove-wishlist-item/'+proId,
        method:"get",
        success:(response)=>{
            if(response.status){
                swal("Product Removed from Wishlist Successfully", {
                    icon: "success",
                  }).then(()=>{
                    location.reload()
                    
                    
            

                  })
                    
                  

            }
           

        }
    })
   
}