var Crawler = require("crawler")
var async = require('async')
var fs = require('fs');
var path = require('path')

var c = new Crawler({
    maxConnections:10,
    callback:function(err, res, done){
        if(err){
            console.log('err',err)
        }else{
            console.log(res.$("title").text());
        }
        done()
    }
})


c.queue({
    jQuery:true,
    uri:"https://y.tuwan.com/",
    callback : function(err, res, done){
        if(err){
            console.error(err.stack);
        }else{
            var $ = res.$
            var list = []
            $('img').each(function(element){
                var src=$(this).attr("src")
                // console.log(src)
                if(src.match(/^http/)){
                    list.push(src)
                }
                if(src.match(/^\/\//)){
                    list.push('http:'+src)
                }
            });
        }
        done();
        down_file(list)
    }
})

function down_file(list){
    delDir('./dist')
    async.map(list,function(url){
        var name=url.replace(/(.*\/)*([^.]+).(\s{0,})[?.*]/ig,"$2.$3");
        c.queue({
                encoding:null,
                jQuery:false,
                uri:url,
                // preRequest: function(options, done) {
                //     setTimeout(function() {
            	//     console.log(options);
                //     done();
                    
                //     })
                // },
                callback : function(err, res, done){
                    if(err){
                        console.error(err.stack);
                    }else{
                        fs.createWriteStream('./dist/'+name).write(res.body);
                    }
                    
                    done();
                }
            });
        return 
    },function(err,res){
        console.log('res',res)
        console.log('err',err)
    })
};

function delDir(path){
    let files = [];
    if(fs.existsSync(path)){
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()){
                delDir(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        // fs.rmdirSync(path);
    }

}
