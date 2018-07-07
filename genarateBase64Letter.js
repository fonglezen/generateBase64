/* 
    根据首字母来划分json文件
    命令行传参：node genarateBase64Letter.js [src] [jsonFileDir]
    src: 图片目录
    jsonFileName: 生成的json文件目录
*/

const fs = require('fs');
const src_dir = process.argv[2];
let jsonfilename = process.argv[3];

const typeallow = ['jpg','jpeg','gif','png'];

let data_json = {};
let files_length = 0, handle_count = 0;

if(src_dir && fs.existsSync(src_dir)){
    if(!jsonfilename){
        jsonfilename = src_dir + '/imgjson';
    }

    // 循环遍历目录下的文件
    let files = fs.readdirSync(src_dir);
    files_length = files.length;

    files.forEach((file) => {
        
        handlefile(file);

    });

    
}else {
    console.log('图片目录不正确');
}

function handlefile(file) {
    let filepath = `${src_dir}/${file}`;
    let filesplit = file.split('.');
    let filetype = filesplit[filesplit.length - 1];

    getFilesize(filepath).then((data) => {
        
        // 图片大小小于100k，且图片格式正确
        if(data.size / 1024 < 100 && typeallow.indexOf(filetype) != -1){

            readFile(filepath).then((base64) => {
                let first_letter = file.substring(0,1);
                if(/[a-zA-Z]/.test(first_letter)){
                    first_letter = first_letter.toLowerCase();
                }else{
                    first_letter = 'other';
                }

                if(data_json[first_letter]){
                    data_json[first_letter][file] = base64;
                }else{
                    data_json[first_letter] = {};
                    data_json[first_letter][file] = base64;
                }
                

                handle_count += 1;
    
                if(handle_count == files_length){
                    // 最后一个
                    console.log('allDone!!!')
                    console.log('data_json',data_json)

                    for(let index in data_json){
                        fs.writeFile(jsonfilename + '/imgjson_' + index + '.json', JSON.stringify(data_json[index]), (err) => {
                            if (err) throw err;
                            console.log('文件已保存！');
                        });
                    }

                    
                }
            });
            

        }else {
            // 图片过大，跳过，格式不符合跳过
            handle_count += 1;
        }
    });
    

    
}

function getFilesize(filepath) {
    return new Promise((resolve, reject) => {
        fs.stat(filepath, (err, data) => {
            resolve(data);
        })
    });
}

function readFile(filepath){
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, (err, data) => {
            resolve(data.toString('base64'));
        });
    });
    
}
