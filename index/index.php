<?php
ob_start();
session_start();
$action = isset($_GET['action']) ? $_GET['action'] : '';
$guild = isset($_GET['guild']) ? $_GET['guild'] : '';

$ownerid = "334979056095199233";
$invitelink = "https://discord.com/api/oauth2/authorize?client_id=695656027911225406&permissions=8&scope=bot";

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);

error_reporting(E_ALL);

$con = new mysqli("host", "root", "pass", "db");

if(mysqli_connect_errno()) {
    header("Location: /error");
    exit();
}

function CheckGuild($con, $id) {
    $query = mysqli_query($con, "SELECT * FROM guilds WHERE guild_id='".$id."'");

    if(!$query) {
        header("Location: ./");
    }

    if(mysqli_num_rows($query) > 0) {
        return 1;
    }
    else {
        return 0;
    }
}

function CheckGuildIcon($id, $icon) {
    if(!$icon) $img = "./images/no_image.png";
    else $img = 'https://cdn.discordapp.com/icons/' . $id . '/' . $icon . '.png';
    return $img;
}

define('OAUTH2_CLIENT_ID', '695656027911225406'); //Your client Id
define('OAUTH2_CLIENT_SECRET', '3KaADea0fjiMQfriF1MuCCaWCJgzo9LN'); //Your secret client code

$authorizeURL = 'https://discordapp.com/api/oauth2/authorize';
$tokenURL = 'https://discordapp.com/api/oauth2/token';
$apiURLBase = 'https://discordapp.com/api/users/@me';
$apiURLGuilds = 'https://discordapp.com/api/users/@me/guilds';

if(isset($_COOKIE["access_token"])) { $_SESSION["access_token"] = $_COOKIE["access_token"]; }
else {
    session_destroy();
    $_SESSION["access_token"] = 0;
}

if(get("code")) {
    // Exchange the auth code for a token
    $token = apiRequest($tokenURL, array(
    "grant_type" => "authorization_code",
    'client_id' => OAUTH2_CLIENT_ID,
    'client_secret' => OAUTH2_CLIENT_SECRET,
    'redirect_uri' => 'http://e-force.ro/clorify',
    'code' => get("code")
    ));
    setcookie('access_token', $token->access_token, 0, '', 'e-force.ro');
    $_SESSION["access_token"] = $token->access_token;

    header("Location: ./");
}

// -> Java Scripts
?>
<script>
function smallPageLoad(url) {
    var checking = window.open(`${url}`, "_blank", "width=500,height=800");
    /*setInterval(() => {
        console.log(checking.document);
    }, 1000);*/
}
</script>
<?php

$user = apiRequest($apiURLBase);
$guilds = apiRequest($apiURLGuilds);
$sess_token = $_SESSION["access_token"];

if($user && $sess_token) {
    $query = mysqli_query($con, "SELECT * FROM `sessions` WHERE `user_id` = '$user->id' AND `access_token` = '$sess_token'");

    if(!$query) {
        header("Location: ./");
    }

    if(mysqli_num_rows($query) == 0) {
        $con->query("INSERT INTO `sessions` VALUES ('$user->id', '$sess_token'");
    }
}

?>
<head>
    <meta charset=UTF-8>
    <title>Clorify BOT Dashboard</title>
    <meta property="og:type" content="website">
    <meta property="og:url" content="http://e-force.ro/clorify">
    <meta property="og:title" content="Clorify BOT Dashboard">
    <meta property="og:description" content="Manage your discord guilds and channels">
    <meta property="og:image" content="images/profile.png">
    <meta name="theme-color" content="#00DD00">

    <link href="css/styles.css" rel="stylesheet">
    <link href="https://cdn.datatables.net/1.10.20/css/dataTables.bootstrap4.min.css" rel="stylesheet" crossorigin="anonymous">
    <link rel="icon" type="image/png" href="https://cdn.discordapp.com/avatars/695656027911225406/a2cf195b0997004b0f18af777ea78edc.png">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/js/all.min.js" crossorigin="anonymous"></script>
</head>
<body class="sb-nav-fixed">
<nav class="sb-topnav navbar navbar-expand navbar-dark bg-dark">
    <img src="https://cdn.discordapp.com/avatars/695656027911225406/a2cf195b0997004b0f18af777ea78edc.png" style="border-radius: 50%; background-size: 30px; width: 30px; height: 30px; min-height: 30px; min-width: 30px;"></img>
    <button class="btn btn-link btn-sm order-lg-0" id="sidebarToggle" href="#"><i class="fas fa-bars"></i></button>
    <ul class="navbar-nav d-none d-md-inline-block form-inline ml-auto mr-0 mr-md-3 my-2 my-md-0">
        <?php if($_SESSION["access_token"]) { 
            ?>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" id="userDropdown" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><img src="https://cdn.discordapp.com/avatars/<?=$user->id?>/<?=$user->avatar?>" style="border-radius: 50%; background-size: 30px; width: 30px; height: 30px; min-height: 30px; min-width: 30px;"></img> <?=$user->username?></a>
                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
                    <a class="dropdown-item" href="#"><i class="fas fa-cog"></i> Settings</a>
                    <a class="dropdown-item" href="#"><i class="fas fa-chart-line"></i> Activity Log</a>
                    <?php if($user->id == $ownerid) { ?> <a class="dropdown-item" href="?option=cp"><i class="fas fa-tools"></i> Clorify CP</a> <?php } ?>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item" href="?action=logout"><font color="red"><i class="fas fa-sign-out-alt"></i> Logout</font></a>
                </div>
            </li>
            <?php
        }
        else {
            ?>
            <a href="?action=login"><font color="#FFFFFF"><i class="fas fa-sign-in-alt"></i> Login</font></a>
            <?php
        }
        ?>
    </ul>
</nav>
<div id="layoutSidenav">
<div id="layoutSidenav_nav">
    <nav class="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
        <div class="sb-sidenav-menu">
            <div class="nav">
                <div class="sb-sidenav-menu-heading">Dashboard</div>
                <a class="nav-link" href="./">Home</a>
                <a class="nav-link" href="#" onclick="smallPageLoad('./?option=support')">Support server</a>
                <?php if($_SESSION["access_token"]) { ?><a class="nav-link" href="./?option=myservers">My servers</a> <?php }
                ?>
                <a class="nav-link" href="./?option=commands">Available commands</a>
            </div>
        </div>
    </nav>
</div>
</div>
<script src="https://code.jquery.com/jquery-3.5.1.min.js" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
<script src="js/scripts.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.min.js" crossorigin="anonymous"></script>
<script src="assets/demo/chart-area-demo.js"></script>
<script src="assets/demo/chart-bar-demo.js"></script>
<script src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js" crossorigin="anonymous"></script>
<script src="https://cdn.datatables.net/1.10.20/js/dataTables.bootstrap4.min.js" crossorigin="anonymous"></script>
<script src="assets/demo/datatables-demo.js"></script>
</body>
<?php

//if(session('access_token') && $user->username && $guilds) 

if(!$guild) {
    $option = isset($_GET['option']) ? $_GET['option'] : '';

    if($option == "cp") {
        if($_SESSION["access_token"]) { 
            if($user->id == $ownerid) {

            }
            else header("location: ./");
        }
        else header("location: ./");
    }
    else if($option == "myservers") {
        if($_SESSION["access_token"]) {
            ?>
            <div id="layoutSidenav">
                <div id="layoutSidenav_content">
                    <main>
                        <div class="container-fluid">
                            <div class="xnzm8l-0 kNuROn">
                                <h1 class="xnzm8l-1 bUIaVe">Please select a server</h1>
                                <main class="xnzm8l-4 hPbmYh">
                                    <?php
                                    for($i = 0; $i != count($guilds); $i++) {
                                        if($guilds[$i]->permissions == 2147483647)
                                        {
                                            if(CheckGuild($con, $guilds[$i]->id) == 1)
                                            {
                                                ?>
                                                <div class="xnzm8l-2 bOgvri">
                                                    <div class="sc-6rly6x-1 sc-6rly6x-2 cGxQuM">
                                                        <img class="sc-1epwdr8-0 ljeLcp" src="<?=CheckGuildIcon($guilds[$i]->id, $guilds[$i]->icon);?>" size="40" radius="25" alt="Logo of <?=$guilds[$i]->name?>">
                                                        <span class="xnzm8l-3 hzXPna"><?=$guilds[$i]->name?></span>
                                                    </div>
                                                    <a href="?guild=<?=$guilds[$i]->id?>"><button class="xnzm8l-5 eocHJI sc-1x57bl6-0 dpKwct" color="#44b37f">Go to Dashboard</button></a>
                                                </div>   
                                                <?php
                                            }
                                        }
                                    }
                                    for($i = 0; $i != count($guilds); $i++) {
                                        if($guilds[$i]->permissions == 2147483647) {
                                            if(CheckGuild($con, $guilds[$i]->id) == 0) {
                                                ?>
                                                <div class="xnzm8l-2 bOgvri">
                                                    <div class="sc-6rly6x-1 sc-6rly6x-2 cGxQuM">
                                                        <img class="sc-1epwdr8-0 ljeLcp" src="<?=CheckGuildIcon($guilds[$i]->id, $guilds[$i]->icon);?>" size="40" radius="25" alt="Logo of <?=$guilds[$i]->name?>">
                                                        <span class="xnzm8l-3 hzXPna"><?=$guilds[$i]->name?></span>
                                                    </div>
                                                    <a href="https://discord.com/oauth2/authorize?client_id=695656027911225406&scope=bot&guild_id=<?=$guilds[$i]->id?>"><button class="xnzm8l-6 eVVxFh sc-1x57bl6-0 kToTJk" color="#44474c">Set up Clorify</button></a>
                                                </div>   
                                                <?php
                                            }
                                        }
                                    }
                                    ?>
                                </main>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            <?php
        }
    }
    else if($option == "support") { header("location: https://discord.gg/pU3ABM4vw4"); }
    else if($option == "invite") { header("location: $invitelink"); } 
    else if($option == "commands") {
        ?>
        <div id="layoutSidenav">
            <div id="layoutSidenav_content">
                <main>
                    <div class="container-fluid">
                        <div class="xnzm8l-0 kNuROn">
                        <h1 class="xnzm8l-1 bUIaVe">Here you can find all available commands.<br>You need to use <font color="red">clorify, [command]</font></h1>
                        <div class="row justify-content-md-center" id="list">
                        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div class="text-center">
                        </div>
                        </div>
                        <div class="col-sm-12 col-xs-12">
                        <table class="table">
                        <tbody>
                        <th><font color="#00DD00"><strong>Command</strong></font></th>
                        <th><font color="#00DD00"><strong>Description</strong></font></th>
                        <?php                         
                        $sql = $con->query("SELECT * FROM `commands` ORDER BY `id`");
                        if($sql->num_rows > 0) {
                            while($row = $sql->fetch_assoc()) {
                                ?>
                                <tr>
                                <td><?=$row["command"]?></td>
                                <td><?=$row["description"]?></td>
                                </tr>
                                <?php 
                            }
                        }
                        ?>
                        </tbody>
                        </table>
                        </div>
                        </div>
                    </div>
                </main>
            </div>
        <?php 
    }
    else {
        ?>
        <div id="layoutSidenav">
            <div id="layoutSidenav_content">
                <main>
                    <div class="Hero">
                        <div class="HeroInner">
                            <h1>Build a good discord Server</h1>
                            <p>Configure your guilds and channels with Clorify</p>
                            <div class="HeroButtons">
                                <div class="HeroButtonWrapper">
                                    <button type="button" class="button brand default large grow " style="font-size: 17px;" onclick="smallPageLoad('./?option=invite')">
                                        <img src="./assets/img/a219956caf348a5bc3434b17fce51349.svg" style="margin-inline-end: 15px;">Clorify - Add to Discord
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
        <?php
    }
}
else {
    if($_SESSION["access_token"]) {
        $exist = 0;
        $exist_array = -1;
        for($i = 0; $i != count($guilds); $i++) {
            if($guilds[$i]->id == $guild) {
                $exist = 1;
                $exist_array = $i;
            }
        }
        if($exist == 1) {
            $option = isset($_GET['option']) ? $_GET['option'] : '';

            if(!$option) {
                if($guilds[$exist_array]->permissions == 2147483647) {
                    if(CheckGuild($con, $guilds[$exist_array]->id) == 1) {
                        ?>
                        <div id="layoutSidenav">
                            <div id="layoutSidenav_content">
                                <main>
                                    <div class="container-fluid">
                                        <br><h1 class="xnzm8l-1 bUIaVe"><img src="<?=CheckGuildIcon($guilds[$exist_array]->id, $guilds[$exist_array]->icon);?>" style="border-radius: 50%; background-size: 50px; width: 50px; height: 50px; min-height: 50px; min-width: 50px;"></img> <?=$guilds[$exist_array]->name;?></h1>
                                        <div class="taak0c-0 dPizwc">
                                            <a href="?guild=<?=$guilds[$exist_array]->id?>&option=1">
                                                <div class="taak0c-2 eYgdIU">
                                                    <div class="taak0c-3 hHVOam">
                                                        <img src="./assets/img/229efaeb82f2d2e17ede5e09b6589bbb.svg">
                                                    </div>
                                                    <div class="taak0c-4 faLznG">
                                                        <div class="taak0c-5 dxeudU">Custom Commands</div>
                                                        <div class="taak0c-6 byfIHy">Add awesome custom commands to your server</div>
                                                    </div>
                                                </div>
                                            </a>
                                            <a href="?guild=<?=$guilds[$exist_array]->id?>&option=2">
                                                <div class="taak0c-2 eYgdIU">
                                                    <div class="taak0c-3 hHVOam">
                                                        
                                                    </div>
                                                    <div class="taak0c-4 faLznG">
                                                        <div class="taak0c-5 dxeudU">Prefix</div>
                                                        <div class="taak0c-6 byfIHy">Set a custom prefix to your server</div>
                                                    </div>
                                                </div>
                                            </a>
                                            <a href="?guild=<?=$guilds[$exist_array]->id?>&option=3">
                                                <div class="taak0c-2 eYgdIU">
                                                    <div class="taak0c-3 hHVOam">
                                                        
                                                    </div>
                                                    <div class="taak0c-4 faLznG">
                                                        <div class="taak0c-5 dxeudU">Soon</div>
                                                        <div class="taak0c-6 byfIHy">This option will be available soon</div>
                                                    </div>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </main>
                            </div>
                        </div>
                        <?php
                    }
                }
            }
            else {
                if($option == 1) {
                    $type = isset($_GET['type']) ? $_GET['type'] : '';
                    if(!$type) {
                        ?>
                        <div id="layoutSidenav">
                            <div id="layoutSidenav_content">
                                <main>
                                    <div class="container-fluid">
                                        <br><h1 class="xnzm8l-1 bUIaVe"><img src="<?=CheckGuildIcon($guilds[$exist_array]->id, $guilds[$exist_array]->icon);?>" style="border-radius: 50%; background-size: 50px; width: 50px; height: 50px; min-height: 50px; min-width: 50px;"></img> <?=$guilds[$exist_array]->name;?></h1>
                                        <div class="PluginWrapper">
                                            <span>
                                                <div class="pluginHeading">
                                                    <div class="pluginIcon">
                                                        <img src="./assets/img/229efaeb82f2d2e17ede5e09b6589bbb.svg">
                                                    </div>
                                                    <div class="pluginTitle">Custom Commands</div>
                                                    <div class="pluginActions">
                                                        <button class="sc-1x57bl6-0 gsFghA" color="#faa51b">Disable</button>
                                                    </div>
                                                </div>
                                                <span></span></span>
                                                <a href="?guild=<?=$guilds[$exist_array]->id?>&option=1&type=1">
                                                    <h2>Create a Command</h2>
                                                    <div class="sc-1f68zoc-3 eiVNuG">
                                                        <div class="sc-1f68zoc-4 dJkKVC">
                                                            <span class="sc-1f68zoc-5 gLWbns">Text Command  </span>
                                                            <div class="sc-1f68zoc-6 vJkct">A simple command that responds with a custom message in public channel</div>
                                                        </div>
                                                    </div>
                                                </a>
                                                
                                                <!--
                                                <h2 class="sc-1f68zoc-2 expZKd">Commands
                                                    <span class="sc-1f68zoc-1 iDVHdN"> — 2 slots available</span>
                                                </h2>
                                                <div class="sc-6rly6x-1 sc-6rly6x-3 eIuYad">
                                                    <div class="CommandViews">
                                                        <div class="CommandView">
                                                            <div class="CommandViewDelete">
                                                                <img src="assets/img/e8cf8ee58a2a5582031d077b7fb1f0e1.svg">
                                                            </div>
                                                            <div class="CommandText">
                                                                <div class="CommandName">
                                                                    <span dir="ltr">!ip</span>
                                                                </div>
                                                                <div class="CommandDescription">An awesome command!</div>
                                                            </div>
                                                            <div class="CommandInfoContainer">
                                                                <div class="CommandInfo">
                                                                    <button class="sc-1x57bl6-0 bZCood" color="#ffffff">Edit</button>
                                                                </div>
                                                                <div class="CommandInfo">
                                                                    <form>
                                                                        <div color="#5ac0de" tabindex="0" role="checkbox" aria-checked="true" class="sc-1qrnzt-0 dimXbt">
                                                                            <div color="#5ac0de" class="sc-1qrnzt-1 cpGumI"></div>
                                                                        </div>
                                                                    </form>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div> -->
                                            </span>
                                        </div>
                                    </div>
                                </main>
                            </div>
                        </div>
                        <?php       
                    }
                    else {
                        if($type == 1) {

                        }
                        else header("location: ./");
                    }
                }
                else header("location: ./");
            }
        }
        else header("location: ./");
    }
    else header("location: ./");
} 

if($action == "login") {
    if(!$_SESSION["access_token"]) {
        session_destroy();
        $_SESSION["access_token"] = 0;
        $params = array(
        'client_id' => OAUTH2_CLIENT_ID,
        'redirect_uri' => 'http://e-force.ro/clorify',
        'response_type' => 'code',
        'scope' => 'identify guilds email'
        );

        // Redirect the user to Discord's authorization page
        header('Location: https://discordapp.com/api/oauth2/authorize' . '?' . http_build_query($params));
        die();
    }
    else header("location: ./");
}

if($action == "logout") {
    session_destroy();
    $_SESSION["access_token"] = 0;
    unset($_COOKIE['access_token']);
    setcookie('access_token', '', time() - 3600, '', 'e-force.ro');
    header("location: ./");
}

function apiRequest($url, $post=FALSE, $headers=array()) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
  
    $response = curl_exec($ch);
  
  
    if($post)
      curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post));
  
    $headers[] = 'Accept: application/json';
  
    if(isset($_COOKIE['access_token']))
      $headers[] = 'Authorization: Bearer ' . $_COOKIE['access_token'];
  
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
  
    $response = curl_exec($ch);
    return json_decode($response);
}
  
function get($key, $default=NULL) {
    return array_key_exists($key, $_GET) ? $_GET[$key] : $default;
}

function session($key, $default=NULL) {
    return array_key_exists($key, $_SESSION) ? $_SESSION[$key] : $default;
}
?>
