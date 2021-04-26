const token = 'xxxxxxxxxxxxxxxxxx'
const SLACK_TOKEN = 'xxxxxxxxxxxxxxxxxxxxxx'
const CHANNEL_ID = '#a'

today = new Date();
const YEAR = today.getFullYear();
const MONTH = today.getMonth() + 1;
const DATE = today.getDate();
var minLikesCount = 5;
var keyWard = "Ruby"
var targetUrl = [];

function qiitaUrl(page, YEAR, MONTH, DATE) {
  return `https://qiita.com/api/v2/items?query=created%3A%3E${YEAR}-${MONTH}-${DATE}&page=${page}`
}


// メインの処理
main ()

function main () {
  for (var i=1; i < 20; i++) {
    // var request = new XMLHttpRequest();
    // mainRequest(request, i)
    mainFetch(i)
  }
}

// ？？asyncを入れて、非同期処理にしようとしたが、動作的に必要なかった。なぜ
// breakを入れる処理をどこに入れれば良いかわからない
function mainFetch (i) {
  var url = new URL(qiitaUrl(i, YEAR, MONTH, DATE-1));

  fetch(url, {
    method: 'get',
    headers: {
      'Authorization': 'Bearer '+ token
    }
  }).then((response)=>{
    return response.json();
  }).then((data)=>{
    if (data.length !== 0){
      getTargetUrl(data).forEach(function(value) {
        if (value !== 0) {
          slackPost(value);
        }
      })
    } else {
      console.log('終わり')
    }
  },
  error => {
    console.log(error);
  })
};

function getTargetUrl (data) {
  target = []
  for (var j = 0; j < data.length; j++) {
    if (data[j].likes_count >= minLikesCount && data[j].tags.some( x => x.name === keyWard)) {
      target.push(data[j].url);
    }
  }
  return target
}

function slackPost(text) {
  var url = 'https://slack.com/api/chat.postMessage';

  var data = {
    token: SLACK_TOKEN,
    channel: '#a',
    text: text
  };
  var dataArray = [];
  for( key in data ) {
    dataArray.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
  }
  urlEncodedData = dataArray.join( '&' ).replace( /%20/g, '+' );

  // XMLHttpRequestを利用して送信
  var request = new XMLHttpRequest();

  request.open('Post', url, true);
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
  request.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      console.log("success")
    }
  }
  request.send(urlEncodedData);

  // // fetchを利用して送信
  // fetch(url, {
  //   method: 'POST',
  //   body: urlEncodedData,
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //   }
  // }).then((response)=>{
  //   return response.json();
  // }).then((data)=>{
  //   console.log( 'Can I post to Slack? :' + data.ok );
  //   console.log(data);
  //   if (data.ok ){
  //       // alert("SLACK への投稿が完了しました");
  //   }else{
  //       // alert("SLACK への投稿が失敗しました:" + data.error);
  //   }
  // }).catch((data)=>{
  //     console.error(data);
  //     // alert('error:' + data);
  // });

}


function mainRequest (request, i) {
  var url = new URL(qiitaUrl(i, YEAR, MONTH, DATE-2));

  // 非同期で処理を行うと、requestを送る前に先のループ処理のrequestが作成されてしまう。
  //
  request.open('GET', url, false);
  request.setRequestHeader('Authorization', 'Bearer '+ token)
  console.log(i);
  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == 200) {
      var data = JSON.parse(request.responseText);
      console.log(i);
      console.log(data);
      if (data.length === 0) {
        console.log(targetUrl);
        targetUrl.forEach(function(value) {
          slackPost(value);
          // ダウンロード処理
          // window.open(value, '_self');
        })
        // break;
        // break;
      }
      addTargetUrl(data);
    }
  }
  request.send();
}

// slackに送る対象のurlを追加
function addTargetUrl (data) {
  for (var j = 0; j < data.length; j++) {
    if (data[j].likes_count >= minLikesCount) {
      targetUrl.push(data[j].url);
    }
  }
}
