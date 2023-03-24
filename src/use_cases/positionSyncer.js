export class PositionSyncer {
    constructor(wsClientOperator, roomOperator) {
        this.wsClientOperator = wsClientOperator;
        this.roomOperator = roomOperator;
    }

    sync(requestPositionRate, sendPositionDelay) {
        // requestPositionRate (seconds): is the time to request the users
        // to send their positions.
        // sendPositionDelay (seconds): is the time to wait to send the
        // new positions of the users
        
        // Conver to milliseconds
        requestPositionRate = requestPositionRate*1000;
        sendPositionDelay = sendPositionDelay*1000;

        setInterval(
            this.wsClientOperator.requestUsersAttitude.bind(this.wsClientOperator),
            requestPositionRate
        );
        const updatePostRate = requestPositionRate + sendPositionDelay;
        setInterval(
            this.sendUsersAttitude.bind(this),
            updatePostRate
        )
    }

    sendUsersAttitude() {
        /* 
        {
            type: "new_users_attitude",
            data: {
                rooms: [
                {
                    room_id: 1,
                    users: [
                        {
                            user_id: 1,
                            position: [10.0, 20.0, 30.0]
                        },
                        {
                            user_id: 2,
                            position: [100.0, 230.0, 230.0]
                        },
                        
                    ]
                },
                {
                    room_id: 2,
                    users: [
                        {
                            user_id: 5,
                            position: [130.0, 320.0, 340.0]
                        },
                        {
                            user_id: 2,
                            position: [140.0, 20.0, 220.0]
                        },
                        
                    ]
                }
            ]
            }
        }
        */

        const payload = {
            type: "new_users_attitude",
            data: {
                rooms: []
            }
        }

        const rooms = this.roomOperator.getAllRoomsAvailable();

        const noRoomAvailable = rooms.size == 0;
        if(noRoomAvailable) {
            return;
        }

        rooms.forEach(room => {
            const room_id = room.room_id;
            const users = this.roomOperator.getAllUsersInRoom(room_id);

            const users_position = [];
            users.forEach(user => {
                const id = user.user_id;
                const position = user.position;
                const orientation = user.orientation;
                const current_animation = user.current_animation;
                
                users_position.push({
                    user_id: id,
                    position: position,
                    orientation: orientation,
                    current_animation: current_animation
                });
            });

            const room_data = {
                room_id: room_id,
                users: users_position
            }

            payload.data.rooms.push(room_data);
        });

        this.wsClientOperator.broadcastPayloadFromServer(payload);
    }
}
