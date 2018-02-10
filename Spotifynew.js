// referene from https://developer.spotify.com/web-api/authorization-guide/
// this is build base on the instruction , the flow of 
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');

const CLIENT_ID = 'c778e8173793481c907f2ee677fdf578'; // Your client id
const CLIENT_SECRET = '3d5d8daa997a4b29b11100d55b018ad2'; // Your secret
const REDIRECT_URI = 'http://localhost:8888/callback'; // Your redirect uri
const SCOPE = 'playlist-modify-public playlist-read-collaborative playlist-modify-private'
const playlist_name = "tmp"
const rp = require("request-promise");

// in spotify , 戴佩妮 been record as Penny Tai, her song is ony avaliable if I search with offical name, use a dic to stoore this information 
// request authorization tp access data
module.exports = {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    SCOPE,
    // get_song_uri,
    // get_user_id,
    // create_playlist,
    // get_playlist_id,
    // add_song_to_playlist,
    // add,
}

async function get_user_id(access_token) {
    /**
     * get_user_id : return the user id for the user, some user created with facebook may encounter actual useranme does not match with the one they know
     * String -> Promise
     * => Promise with user's id
     */
    var options = {
        url: "https://api.spotify.com/v1/me",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        json: true
    };
    return new Promise((resolve, reject) => {
        rp(options)
            .then((body) => {
                if (body.id)
                    resolve(body.id)
                reject("Unable to get user id")
            }).catch(error => {
                console.log(JSON.stringify(error));
            });
    })
}



async function check_playlist(user_id, access_token) {
    /**
     * check_playlist : all the song fetch from xiami will been store in a playlist, which name as tmp, this is just prevent dupliate creation 
     * String -> String -> Promise
     * => Promise with None
     */
    var options = {
        url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        json: true
    };
    return new Promise((resolve, reject) => {
        rp(options)
            .then(res => {
                res.items.forEach(element => {
                    if (element.name === playlist_name)
                        reject();
                });
                resolve();
            })
    })
}


async function create_playlist(user_id, access_token) {
    /**
     * create_playlist : create defualt playlist 
     * String -> String -> Promise
     * => Promise with None
     */
    var options = {
        method: "POST",
        url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists',
        body: JSON.stringify({
            'name': playlist_name,
            'public': true
        }),
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json',
        }
    };
    // resolve it the play not been created, otherwise return reject
    check_playlist(user_id, access_token)
        .then((resolve) => {
            rp(options)
                .then(res => resolve())
                .catch(error => {});
        })
        .catch(error => {});
}

async function get_playlist_id(user_id, access_token) {
    /**
     * get_playlist_id : get the playlist id for playlist name 
     * * https://developer.spotify.com/web-api/get-a-list-of-current-users-playlists/
     * @(String , function)
     * => Promise with defualt playlist id
     */
    var options = {
        url: "https://api.spotify.com/v1/users/" + user_id + "/playlists",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        json: true
    };

    return new Promise((resolve, reject) => {
        rp(options)
            .then((body) => {
                for (var i = 0; i < body.items.length; i++) {
                    element = body.items[i];
                    if (element.name === playlist_name)
                        resolve(element.id, access_token);
                }
                reject({
                    message: "Unable to find playlist " + playlist_name
                });
            }).catch(error => {
                error: error
            })
    })
}



// ///// all the function above should be called only once///////////////////////////////////////////////////////

function get_artist_offical_name(artist, access_token) {
    /***
     * during spotify searching, it is more accurate to get the official name that spotify recorded
     * the search return a new promise with artist offical name 
     */
    var options = {
        url: "https://api.spotify.com/v1/search?q=" + encodeURIComponent(artist) + "&type=artist",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        json: true
    };

    return new Promise((resolve, reject) => {
        rp(options)
            .then((body) => {
                if (body.artists && body.artists.items.length != 0)
                    resolve(body.artists.items[0].name);
                else
                    reject({
                        message: "Unable to find artirst" + artist
                    });
            }).catch(error => {
                reject({
                    error: error.statusCode
                })
            })
    })
}

function get_song_uri(track, artist, access_token) {
    /**
     * get_song_uri : get the uri match to track , which will be used in when add music
     * String  -> String -> String -> Promise
     * => Promise with uri as value
     */
    var options = {
        url: "https://api.spotify.com/v1/search?q=" + encodeURIComponent(track) + "&type=track",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        json: true,
        resolveWithFullResponse: true
    };


    return new Promise((resolve, reject) => {
        rp(options)
            .then((response) => {
                body = response.body;

                if (body.tracks && body.tracks.items) {
                    for (var i = 0; i < body.tracks.items.length; i++) {
                        element = body.tracks.items[i];
                        if (encodeURIComponent(element['artists'][0]['name'].toLowerCase()) === encodeURIComponent(name.toLowerCase())) {
                            resolve(element.uri);
                        }
                    }
                }
                reject({
                    message: `Unable to find song for ${track} ${name}`
                });
            }).catch((error) => {
                reject(error => {
                    error: error.statusCode
                });
            })
    })
}


function get_song_uri(track, artist, access_token) {
    /**
     * get_song_uri : get the uri match to track , which will be used in when add music
     * String  -> String -> String -> Promise
     * => Promise with uri as value
     */
    var options = {
        url: "https://api.spotify.com/v1/search?q=" + encodeURIComponent(track) + "&type=track",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        json: true,
        resolveWithFullResponse: true
    };


    return new Promise((resolve, reject) => {
        rp(options)
            .then((response) => {
                body = response.body;
                if (body.tracks && body.tracks.items) {
                    for (var i = 0; i < body.tracks.items.length; i++) {
                        element = body.tracks.items[i];
                        if (encodeURIComponent(element['artists'][0]['name'].toLowerCase()) === encodeURIComponent(artist.toLowerCase())) {
                            resolve(element.uri);
                        }
                    }
                }
                reject({
                    message : `Unable to find data for ${track} ${artist}`})
            }).catch((error) => {
                reject({
                    error: error
                });
            })
    })
}


async function get_songs_uri(arr, access_token) {
    var passed = [];
    var fail = [];
    for (var i = 0; i < arr.length; i++) {
        element = arr[i];
        // console.log(element[0], element[1], "!");
        // var uri = await get_song_uri(element[0], artist, access_token).catch(error => error);
        var artist = await get_artist_offical_name(element[1], access_token).catch(error => error);
        if (typeof artist !== "object") {
            // found something
            var uri = await get_song_uri(element[0], artist, access_token).catch(error => error);
            console.log(uri);
            console.log(typeof uri !== "object");
            if (typeof uri !== "object") {
                passed.push(uri);
                
            }else{
                // console.log(uri);
            }
        } else {
            // console.log(artist);
        }
    }
    console.log(passed, passed.length);

}


// get_user_id("BQaC8w5_VZxU3BZfv6KLNke_rgd2aH5nQnomaPf6FsIEb58A9Tz60oxo_6KAT7lFbv2QKTQwiTV6ElFZ1P2zHjBNX5vFJNHQckeRZBjUIOkV7BwBdys3UJh-et81MiGqqHP2URMcYV9Umpjb3WRT9XX_2IwgotXFXZEtGliwwEwt36hRnQotH6F7joFzsQeqC7gN9qaNlR9l0NE").then(res => console.log(res))


// console.log(username);


var test_data = {
    'Always on My Mind': 'Elvis Presley',
    '兰州 兰州': '低苦艾',
    'Hymn for the Weekend': 'Coldplay',
    '不和リン': '青叶市子',
    'クロノスタシス': 'きのこ帝国',
    '米店': '张玮玮郭龙',
    '若水': '西楼',
    '啊朋友 再见': '蒋明冬子刘东明好妹妹乐队钟立风小河',
    'Waltz by the River': 'Eleni Karaindrou',
    '青春': '韩红',
    'The Days': 'AviciiRobbie Williams',
    'The Nights': 'AviciiRas',
    'Mi Gente': 'J. BalvinWilly WilliamBeyoncé',
    'Bank Account': '21 Savage',
    '姐姐': '李雨王鼎渊',
    '无法长大': '赵雷',
    '同步': '范晓萱',
    '最冷一天': '张国荣',
    '当爱已成往事': '张国荣',
    '无底洞': '蔡健雅',
    '不搭': '李荣浩',
    '祝你幸福': '李荣浩',
    'Let It Go (Bearson Remix)': 'BearsonJames Bay',
    'Another Day In Paradise': 'Phil Collins',
    'Over the Rainbow': 'MichitaKeyco',
    '幻期颐': '粒粒',
    'Brazilian Rhyme (Almost There)': 'DJ SLYD.OKaoru',
    '现在的样子': '戴佩妮',
    'MINMI／Nujabes - Song Of Four Seasons (Shiki No Uta)': 'DJ Vital Force',
    'I (Love Myself) [Jean Blanc Remix]': 'Jean BlancKendrick LamarJackson Breit',
    'Lean On': 'Major LazerMØDJ Snake',
    Tattoo: '小林武史',
    Wiggle: 'Jason DeRuloSnoop Dogg',
    '一念之间': '张杰莫文蔚',
    '阳光中的向日葵': '马条',
    '北方': '倪健',
    'Spirited Beginning (Nujabes Tribute)': 'Thomas Prime',
    'Boom (Original Mix)': 'TiëstoSevenn',
    'Marilyn Monroe': 'SEVDALIZA',
    '双栖动物': '蔡健雅',
    '美丽世界的孤儿': '汪峰',
    '存在': '汪峰',
    '一起摇摆': '汪峰',
    '生来彷徨': '汪峰',
    '海芋恋': '萧敬腾',
    'I´m Not The Only One': 'Sam SmithA$AP RockyJean Blanc',
    'There For You': 'Martin GarrixTroye Sivan',
    '痒': '黄龄',
    '不要爱我': '薛凯琪方大同',
    'How to Love': 'Cash CashSofia Reyes',
    '作曲家': '李荣浩',
    '梦田': '齐豫潘越云',
    '迷途羔羊': '张震岳大渊',
    'Easy Love': 'Sigala',
    '秦皇岛': '万能青年旅店',
    'Dear Friend': '顺子',
    '想太多': '李玖哲',
    '就像是一块没有记忆的石头': '陈小熊',
    'Addicted to Your Love (ConKi Edit)': 'Con​KiThe Shady Brothers',
    '突然想起你 (Live)': '林宥嘉',
    '星期三或礼拜三': '魏如萱马頔',
    '第三人称 (Live) ': 'Hush!',
    '脱缰': '陈粒',
    'Airplanes ': 'B.o.BHayley Williams',
    'Daydreamer (Original Mix)': 'KarlKGuitK',
    '你就要走了': '花粥',
    '用情': '张信哲',
    '女孩儿': '不可撤销乐队',
    '丑': '草东没有派对',
    '大风吹': '草东没有派对',
    'Smash The Funk': 'GRiZ',
    'Summer Wine': 'Lana Del Rey',
    '美貌の青空': '大貫妙子坂本龍一',
    'Samsara (feat. Emila) [Extended Mix]': 'Tungevaag & Raaban',
    'Go Solo': 'Tom Rosenthal',
    'PIANO UC-NO.3': '澤野弘之',
    'Wise Man': 'Frank Ocean',
    Tadow: 'FKJMasego',
    '当年情': '张国荣',
    'アルカレミア': 'mol-74',
    'Wide Open': 'The Chemical BrothersBeck',
    'The Invisible Girl': 'Parov Stelar Trio',
    'Soul Below': 'Ljones',
    'Be Mine': 'Jazzinuf',
    '当我想你的时候 (Live)': '汪峰',
    '北京北京 (Live)': '汪峰',
    'Big Jet Plane': 'Angus & Julia Stone',
    'I & I': 'Leola',
    'Winter Reflection (Nujabes Tribute)': 'Niazura',
    'Wildcard (Extended Mix)': 'KSHMR',
    'Stay Gold': '大橋トリオ',
    Oceano: 'Roberto Cacciapaglia',
    '历历万乡': '陈粒',
    'いい日旅立ち': '山口百恵',
    'いい日旅立ち  ': '谷村新司',
    'Ame no akogare (Ode to Nujabes)': 'Romo',
    Thunder: 'Imagine Dragons',
    '张三的歌（Cover 张悬）': '「么凹」',
    '孩子': '西楼',
    '作曲家': '李荣浩',
    '不说': '李荣浩',
    '小芳': '李春波',
    'ウヲアイニ': '岩井俊二',
    Flow: '方大同王力宏',
    '小方': '方大同',
    '夜已如歌': '绿色频道',
    '你快乐(所以我快乐)': '王菲',
    'スパークル (movie ver.)': 'RADWIMPS',
    '神秘嘉宾': '林宥嘉',
    Free: 'Plan B',
    'Wonderful Tonight (Live)': 'Eric Clapton',
    '人海': '燕池',
    'Secrets (Original Mix)': 'TiëstoKSHMRVassy',
    Transmigration: '邱比',
    'Can’t Sleep Love': 'Pentatonix',
    'Am I Wrong': 'Nico & Vinz',
    'Get Lucky': 'Daft PunkPharrell Williams',
    '纪念': '蔡健雅',
    'Happy End': '坂本龍一',
    'Spartacus Love Theme': 'Re:plus',
    '想把我唱给你听': '老狼王婧',
    '乘客': '王菲',
    'Heaven Sent': 'J-LouisZacari',
    'Stereo Hearts ': 'Gym Class HeroesAdam Levine'
}
test_data = Object.keys(test_data).map(x => [x, test_data[x]])

var access_token = "BQDm09ijDLwLcUezrGkyjBwkLkTy3qyt2m8DJfiZ7LIF4u5jw6lbwIa8hYy9UBgLo0ARZRqqsjihAU_NGc_T8ILMXE4EAe7oqRrFrfLMQEahwHMxFMG76lAQ5xA10I7hcxU_XfsnMYExmbst4UUBNjcEk3_cYPL2oCRycaTvmagr0YGyrbjldtg3_9BuuOi_8aAxjOxkaGyOalM";
// console.log(test_data.length);

get_songs_uri(test_data, access_token);