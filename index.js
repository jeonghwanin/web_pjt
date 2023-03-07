const express = require("express");
const pool = require("./db");

const app = express();
const PORT = 8080;

//body 받아오기
app.use(express.json());

//정적 파일 서비스
 app.use('/public', express.static('public'));

// cors
const cors = require('cors');
app.use(cors());

// morgan
const morgan = require('morgan');
app.use(morgan('dev'));

//multer
const path = require('path');
const multer = require('multer');
const { getRandomValues } = require("crypto");
const upload = multer({
    storage : multer.diskStorage({
        destination: (req, file, done)=>{
            done(null, "public/")
        },
        filename:(req,file,done)=>{
            //파일이름+현재
            //hello.jpg ->hello123113272139.jpg
            //해당 파일에 확장자만 가져온다.
            const ext = path.extname(file.originalname);
            //확장자를 제외한 파일 이름
            const fileNameExeptExt = path.basename(file.originalname, ext);
            console.log(fileNameExeptExt);
            //저장할 파일 이름 | 형식
            const saveFileName = fileNameExeptExt + Date.now() + ext;
            done(null, saveFileName);
        },
    }),
    Limits: {fileSize: 5*1024*1024},
});

app.get("/api/menus", async(req, res)=>{
    //전체 메뉴 조회
    try{ 
        const data =await pool.query("SELECT * FROM menus");

        console.log(data);
        return res.json(data[0]);
    } catch(error){
        console.log(error);
        return res.json({
            success:false,
            message:"전체 메뉴 목록 조회에 실패하였습니다."
        })
    }
})
//한가지 메뉴 조회 
app.get("/api/menus/:id", async(req, res)=>{
    //전체 메뉴 조회
    try{ 
        const id = req.params.id;
        const data =await pool.query("SELECT * FROM menus WHERE id = ?", [id]);
        return res.json(data[0]);
    } catch(error){
        console.log(error);
        return res.json({
            success:false,
            message:"전체 메뉴 목록 조회에 실패하였습니다."
        })
    }
})


app.post("/api/menus", upload.single('file'),async(req, res)=>{
        try{ 
            console.log(req.file);
            const file_path = req.file.path;
            console.log(req.body);
            const {name, description} = req.body;
            //?는 mysql2 문법
            //java에서도 사용
            const data = await pool.query(`
            INSERT INTO menus (name, description, image_src)
            VALUES (?, ?,?)
            `,[name,description, file_path])

            return res.json({
                success:true,
                message:"메뉴 등록에 성공하셨습니다."
            });
        } catch(error){
            console.log(error);
            return res.json({
                success:false,
                message:"전체 메뉴 목록 조회에 실패하였습니다."
            })
        }
})

app.patch("/api/menus/:id", async(req, res)=>{
    try{ 
        const data = await pool.query('UPDATE menus SET name = ?, description = ? WHERE id = ?',[req.body.name, req.body.description, req.params.id]);
        return res.json({
            success:true,
            message:"메뉴 수정에 성공하였습니다."
        })
    } catch(error){
        console.log(error);
        return res.json({
            success:false,
            message:"메뉴 수정에 실패했습니다."
        })
    }
})

//post 이미지 변경 /api/menus/:id/image
app.post("/api/menus/:id/image", upload.single('file'),async(req, res)=>{
    try{ 
        console.log(req.file);
        const file_path = req.file.path;
        console.log(req.body);
        const {name, description} = req.body;
        //?는 mysql2 문법
        //java에서도 사용
        const data = await pool.query(`
        UPDATE menus SET image_src = ? WHERE id = ?
        `,[file_path, req.params.id])

        return res.json({
            success:true,
            message:"이미지 변경에 성공하셨습니다."
        });
    } catch(error){
        console.log(error);
        return res.json({
            success:false,
            message:"이미지 변경에 실패하셨습니다."
        })
    }
})

app.delete("/api/menus/:id", async(req, res)=>{
    try{
        const data = await pool.query("DELETE FROM menus WHERE id = ?", [req.params.id]);
        
        return res.json({
            success:true,
            message:"메뉴 삭제에 성공하였습니다."
        })
    }catch(error){
        console.log(error);
        returnres.json({
            success:false,
            message:"메뉴 삭제에 실패하였습니다."
        })
    }
})


//orders
app.get("/api/orders", async(req, res)=>{
    try{
        //menus_id 를 가져와서 데이터 조회
        //quantity, request_detail -> orders 테이블
        //name, description -> menus 테이블
        //id는 중복 a.id라고 명시
        const data = await pool.query(`
        select a.id, quantity, request_detail, name, description
        from orders as a
        INNER JOIN menus as b
        ON a.menus_id = b.id
        ORDER BY a.id DESC
        `)
        return res.json(data[0]);
        
    }catch(error){
        console.log(error);
        return res.json({
            success:true,
            message:"주문 조회에 실패하였습니다."
        })
    }
})

app.post("/api/orders", async(req, res)=>{
    try{
        //menus_id를 넣을 경우
        //외래키이기 때문에 menus 테이블에 존재하는 id를 넣어야 한다.
        const data = await pool.query(`INSERT INTO orders (quantity, request_detail, menus_id)
        VALUES (?, ?, ?)
        `, [req.body.quantity, req.body.request_detail, req.body.menus_id]);
        return res.json({
            success:true,
            message:"주문에 성공하였습니다."
        })
    }catch(error){
        console.log(error);
        return res.json({
            success:false,
            message:"주문에 실패하였습니다."
        })
    }
})
//GET /api/menus/:id

//PATCH /api/menus

//DELETE /api/menus

app.listen(PORT,()=>console.log(`${(PORT)} 서버 가동중`));