/************************************************************************************
 This is your Page Code. The appAPI.ready() code block will be executed on every page load.
 For more information please visit our docs site: http://docs.crossrider.com
 *************************************************************************************/

appAPI.ready(function($) {

    var cartbox_url = 'http://cartbox.parseapp.com';

    appAPI.resources.includeRemoteJS(cartbox_url+'/src/common/addproduct/convertimage.js');
    appAPI.resources.includeRemoteJS(cartbox_url+'/src/common/addproduct/detectstore.js');
    appAPI.resources.includeRemoteJS(cartbox_url+'/src/common/addproduct/productsave.js');
    appAPI.resources.includeRemoteJS(cartbox_url+'/src/common/addproduct/detectstore_addfromcart.js');
    appAPI.resources.includeJS('toastr.min.js');
    appAPI.resources.includeCSS('toastr.min.css');
    appAPI.resources.includeRemoteJS('http://www.parsecdn.com/js/parse-1.2.18.min.js');


    //pare initialize
    Parse.initialize("YCV5ZQm2HBkJ3ugHCDwULH75Nb3NVanr3QscKXXE", "ChwfTXDXKo4UjoSYDbYNWtEFCmoEBraltnYUtVSc");

    //declaration of product array in cart
    var cartbox_array =[];

    //detect user if possible
    var currentuser = Parse.User.current();


    if (currentuser){
        appAPI.db.set("usertoken", currentuser._sessionToken);
    }else{
        token = appAPI.db.get("usertoken");
        if (token){
            Parse.User.become(token, {
                success : function(user){
                    currentuser = user;
                    console.log(currentuser);
                }
            });
        }
    }

    //get items from cartbox
    var storeParser=detectStore(document);
    var product_info;

    if (storeParser != null){
        storeParser.get_cart_box(document, function(arr){
            //cloning array
            if ($.isArray(arr))
                cartbox_array = arr.slice(0);


            if (storeParser!=null){
                console.log('************** visiting ' + storeParser.store + ' store ');
                try{
                    product_info = storeParser.get_product_page_info(document);
                }catch(e){
                    console.log(e);
                    product_info = null;
                }
                if (product_info!=null && product_info['product_name']){
                    toastr.options = {
                        "closeButton": true,
                        "positionClass": "toast-bottom-right",
                        "showDuration": "300",
                        "hideDuration": "1000",
                        "timeOut": "10000",
                        "extendedTimeOut": "10000",
                        "showMethod": "fadeIn",
                        "hideMethod": "fadeOut"
                    };
                    var Product = Parse.Object.extend("Product");
                    var User = Parse.Object.extend("User");

                    var productQuery = new Parse.Query(Product);
                    productQuery.equalTo("store", storeParser.store);
                    productQuery.equalTo("productID", product_info['id'])
                    productQuery.equalTo("user", currentuser);
                    productQuery.count({
                        success: function(count){
                            var info;
                            if (count>0){
                                info = "Product already in Cartbox. <br />";
                            }else{
                                info = storeParser.store +' product found. <br /><button class="btn-info" id="add-to-cartbox">ADD TO CARTBOX</button>';
                            }
                            if (arr!=null &&  ($.isArray(arr)) && arr.length>0) {
                                info += '<br /><button class="btn-info" id="add-all-from-cart">ADD ALL FROM CART</button>';
                            }
                            toastr.info(info);
                            return;
                        }
                    });

                }
            }
        })
    }

    $('#add-all-from-cart').live('click', function(){
        //check if the user is logged in
        var User = Parse.Object.extend("User");
        var userQuery = new Parse.Query(User);
        if (currentuser != null && currentuser !=undefined){
            userQuery.equalTo("username", currentuser.get("username"));
            userQuery.count({
                success:function(count){
                    if (count === 0){
                        alert("Please log in to add to cartbox");
                        appAPI.tabs.create(cartbox_url+'/#/signin');
                        return;
                    }else{
                        for (var i=0; i<cartbox_array.length; i++){
                            $.ajax({url: cartbox_array[i]}).done(function(response, textstatus, request){
                                var parser = new DOMParser();
                                var dom = parser.parseFromString(response, "text/html");
                                var sp = detectStore(dom);
                                var p_info = sp.get_product_page_info(dom);
                                var p_url = this.url;
                                if (p_url.substr(0,1) == "/") p_url = "http://" + location.hostname + p_url;
                                console.log(p_url);
                                productSave(p_info, sp, p_url, currentuser );
                            });
                        }
                    }
                }
            });
        }else{
            alert("Please log in to add to cartbox");
            appAPI.tabs.create(cartbox_url+'/#/signin');
            return;
        }
    });

    $('#add-to-cartbox').live('click', function(){
        //check if the user is logged in
        var User = Parse.Object.extend("User");
        var userQuery = new Parse.Query(User);
        if (currentuser != null && currentuser !=undefined){
            userQuery.equalTo("username", currentuser.get("username"));
            userQuery.count({
                success:function(count){
                    if (count === 0){
                        alert("Please log in to add to cartbox");
                        appAPI.tabs.create(cartbox_url+'/#/signin');
                        return;
                    }else{
                        var url = document.location.href;
                        productSave(product_info, storeParser, url, currentuser );
                    }
                }
            });
        }else{
            alert("Please log in to add to cartbox");
            appAPI.tabs.create(cartbox_url+'/#/signin');
            return;
        }
    });

});
