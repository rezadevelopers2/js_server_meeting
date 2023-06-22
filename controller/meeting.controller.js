
const meetingService = require('../service/metting.service');


exports.startMeeting = (reg , res, next) => {

    const {hostId , hostName} = reg.body;

    var model = {
        hostId : hostId,
        hostName :hostName,
        startTime : Date.now()
    };

    meetingService.startMetting(model,(error,results)=>{
       
        if(error){

            return next(error);
        }

        return res.status(200)
        .send({
            message:"Success",
            data :results.id
        });

    });
}

exports.checMeetingkExists = (reg , res, next) => {

    const {meetingId } = reg.query;


    meetingService.checkMeetingExisits(meetingId,(error,results)=>{
       
        if(error){

            return next(error);
        }

        return res.status(200)
        .send({
            message:"Success",
            data :results
        });

    });
}

exports.getAllMeetingUsers = (reg , res, next) => {

    const {meetingId } = reg.query;


    meetingService.getAllMeetingUsers(meetingId,(error,results)=>{
       
        if(error){

            return next(error);
        }

        return res.status(200)
        .send({
            message:"Success",
            data :results
        });

    });
}