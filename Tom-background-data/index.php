<!DOCTYPE html>
<html lang="en" class="no-js"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>User study</title>
<link rel="stylesheet" href="css/app.css"><script src="js/vendor.js"></script>
<script src="js/main.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>


</head>
<body>
<div id="login-screen">
  <div class="form-group">
    <label for="inputEmail3" class="col-sm-2 control-label">Username</label>
    <div class="col-sm-10">
      <input type="text" name="user" class="form-control" id="inputEmail3" placeholder="User">
    </div>
  </div>
  <div class="form-group">
    <label for="inputPassword3" class="col-sm-2 control-label">Password</label>
    <div class="col-sm-10">
      <input type="password" name="pwd" class="form-control" id="inputPassword3" placeholder="Password">
    </div>
  </div>
  
  <div class="form-group">
    <div class="col-sm-offset-2 col-sm-10">
      <button id="verify" class="btn btn-default">Sign in</button>
    </div>
  </div>
</div>

<script>
$('#verify').click( function(){
  var user = $('#inputEmail3').val();
  var pwd = $('#inputPassword3').val();
console.log(user);
console.log(pwd);
  $.ajax({
    url: 'test/login.php',
    type: 'POST',
    data: { User : user, Pwd : pwd},
    success: function (result) {
      console.log(result);
      if (result == 1){
        $('#login-screen').hide();
        $('#survey-container').show();
      }
      else alert("User / password wrong or User alerdy used!");
    },
    error: function(){console.log("error");}
  });
});

</script>
<div id="survey-container" style="display:none">
<div class="contain-to-grid"><nav data-topbar class="top-bar"><ul class="title-area"><li class="name"><h1><a href="#">Investment test</a></h1></li></ul><section class="top-bar-section"><ul class="left"><li class="divider"></li></ul></section><section class="top-bar-section"><ul class="left"><li class="has-dropdown"><a>States</a><ul class="dropdown state-nav"></ul></li></ul></section></nav></div><main><div id="content"><div class="row"><div class="large-12 columns text-center"><h4>Loading</h4><i class="spinner large"></i></div></div></div></main>
</div>
</body>

</html>