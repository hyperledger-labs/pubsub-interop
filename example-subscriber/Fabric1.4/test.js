const request = require('request');
const sync_request = require('sync-request');
var JSON = require("JSON");

// checkJobStatus = async (err, response, body) => {
//     console.log('Yaaayy!!')
//     console.log(body)
//     let greet = await printing('Sara')
//     console.log(greet)
// }

// const options = {
//     url: 'http://obsp.sara-dev.com/controller/job_status/?Job=12',
//     method: 'GET'
// };

// checkJobStatus(null, null, 'Goola!')

// request(options, checkJobStatus);

// async function printing (temp) {
//     console.log('Hello!')
//     return 'Hi!' + temp
// }
 
// console.log(String(Number('10') * 0.000000208))

// let url = 'http://obsp.sara-dev.com/controller/job_status/?Job=' + '12'
// var res = sync_request('GET', url);
// console.log('res: ', res.getBody('utf8')=='True')

async function test(){
    var i;
    for(i=0; i<10; i++){
        console.log('The number is ', i)
        if(i==3){
            throw new Error('Woops!')
        }
    }
}

test()