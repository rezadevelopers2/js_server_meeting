
const meetingService = require('../service/metting.service');

const {MeetingPayloadEnum} = require('../utils/meeting-payload-enum');

async function joinMeeting(meetingId,socket,meetingServer,payload){

    const {userId ,name} = payload.data;

    console.log(payload.data);
    meetingService.isMeetingPresent(meetingId,async (error,results)=>{
     
        if(error && !results){
            sendMessage(socket,{
                type :MeetingPayloadEnum.NOOT_FOUND
            });
        }

        if(results){

            addUser(socket,{meetingId,userId,name})
            .then((result)=>{

                if(result){
                    sendMessage(socket,{type:MeetingPayloadEnum.JOINED_MEETING ,
                    data :{
                        userId
                    }
                    });

                    //not


                    broadcastUsers(meetingId,socket,meetingServer,{

                        type:MeetingPayloadEnum.USER_JOINED,
                        data:{
                            userId,
                            name,
                            ...payload.data
                        }
                    })
                }
            })
        }

    });
}


function forwardConnectionRequest(meetingId,socket,meetingServer,payload){

    const {userId ,otherUserId,name} = payload.data;

    var model = {
        meetingId :meetingId,
        userId:otherUserId
    };

    meetingService.getMeetingUser(model,(error,results)=>{

    if(results){

        var sendPayload = JSON.stringify(
            {
                type:MeetingPayloadEnum.CONNECTION_REQUEST,
                data:{
                    userId,
                    name,
                    ...payload.data
                }
            } );

            meetingServer.to(results.socketId).emit("message",sendPayload);
    }
    });
}

function forwardIceCandidate(meetingId,socket,meetingServer,payload){

    const {userId ,otherUserId,candidate} = payload.data;

    var model = {
        meetingId :meetingId,
        userId:otherUserId
    };

    meetingService.getMeetingUser(model,(error,results)=>{

    if(results){

        var sendPayload = JSON.stringify(
            {
                type:MeetingPayloadEnum.ICECANDIDATE,
                data:{
                    userId,
                    candidate
                }
            } );

            meetingServer.to(results.socketId).emit("message",sendPayload);
    }
    });
}



function forwardOfferSDP(meetingId,socket,meetingServer,payload){

    const {userId ,otherUserId,sdp} = payload.data;

    var model = {
        meetingId :meetingId,
        userId:otherUserId
    };

    meetingService.getMeetingUser(model,(error,results)=>{

    if(results){

        var sendPayload = JSON.stringify(
            {
                type:MeetingPayloadEnum.OFFER_SDP,
                data:{
                    userId,
                    sdp
                
                }
            } );

            meetingServer.to(results.socketId).emit("message",sendPayload);
    }
    });
}


function forwardANSWERSDP(meetingId,socket,meetingServer,payload){

    const {userId ,otherUserId,sdp} = payload.data;

    var model = {
        meetingId :meetingId,
        userId:otherUserId
    };

    meetingService.getMeetingUser(model,(error,results)=>{

    if(results){

        var sendPayload = JSON.stringify(
            {
                type:MeetingPayloadEnum.AUDIO_TOGGLE,
                data:{
                    userId,
                    sdp
                
                }
            } );

            meetingServer.to(results.socketId).emit("message",sendPayload);
    }
    });
}



function userLeft(meetingId,socket,meetingServer,payload){

    const {userId } = payload.data;

    broadcastUsers(meetingId,socket,meetingServer,{

        type :MeetingPayloadEnum.USER_LEFT,
        data:{
            userId:userId
        }
    });

}

function endMeeting(meetingId,socket,meetingServer,payload){

    const {userId } = payload.data;

    broadcastUsers(meetingId,socket,meetingServer,{

        type :MeetingPayloadEnum.END_MEETING,
        data:{
            userId:userId
        }
    });
    meetingService.getAllMeetingUsers(meetingId,(error,results)=>{
        
        for(let i =0 ;i<results.length;i++){

            const meetingUser = results[i];
            meetingServer.sockets.connected[meetingUser.socketId].disconnect();
        }

    })

}


function forwardEvent(meetingId,socket,meetingServer,payload){

    const {userId } = payload.data;

    broadcastUsers(meetingId,socket,meetingServer,{

        type :payload.type,
        data:{
            userId:userId,
            ...payload.data
        }
    });
 

}



function addUser(socket,{meetingId,userId,name}){

    let promies = new Promise(function(resolve,reject){

        meetingService.getMeetingUser({meetingId,userId},(error,results)=>{

            if(!results){
                var model = {
                    socketId:socket.id,
                    meetingId:meetingId,
                    userId:userId,
                    joined:true,
                    name:name,
                    isAlive:true
                };

                meetingService.joinMetting(model,(error,results)=>{

                    if(results){
                        resolve(true);
                    }

                    if(error){
                        reject(error);
                    }
                })
            }else{

                meetingService.updateMeetingUser(
                    {
                        userId:userId,
                        socketId:socket.id,
                    },(error,results)=>{

                        if(results){
                            resolve(true);
                        }
    
                        if(error){
                            reject(error);
                        }
                    });
            }
        });
    });

    return promies;
}


function broadcastUsers(meetingId,socket,meetingServer,payload){
    socket.broadcast.emit("message",JSON.stringify(payload));
}

function sendMessage(socket,payload){
    socket.send(JSON.stringify(payload));
}

module.exports = {
    joinMeeting,
    forwardConnectionRequest,
    forwardIceCandidate,
    forwardOfferSDP,
    forwardANSWERSDP,
    userLeft,
    endMeeting,
    forwardEvent
}