
function oth(role){
        return  (request, reply, done) => {
            if(request.user && request.user && request.user.role === role){
                done();
            } else { 
                reply.send("Ban khong co quyen truy cap.Tinhh nang nay chi danh cho "+role);
            }
        };
};
module.exports = oth;        