const welcomeMail = ({firstName, lastName, clientUrl}) => {
    return (`
        <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh;;">
                <div style="display: flex; gap: 20px; flex-direction: column; width: 300px; height: 60vh; box-shadow: 2px 2px gray; border-radius: 10px; padding: 10px; background-color: beige">
                    <h3 style="color : green; font-weight: bold; font-size: 14px; text-transform: uppercase;">Please Confirm your email address</h3>
                    <p>Dear ${firstName} ${lastName},</p>
                    <p>To Verify your email address, please click on the button below</p>
                    <a style="background-color: green; color: white; border-radius: 10px; padding: 10px; width: 150px; text-decoration: none;" href="${clientUrl}">Verify My Email</a>
                    <p>If you are having troubles with the button above click the link below</p>
                    <a style="color: green; text-decoration: none;" href="${clientUrl}">${clientUrl}</a>
                </div>
            </body>
        </html>
    `)
}

const resetMail = ({firstName, lastName, clientUrl}) => {
    return (`
        <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh;;">
                <div style="display: flex; gap: 20px; flex-direction: column; width: 300px; height: 60vh; box-shadow: 2px 2px gray; border-radius: 10px; padding: 10px; background-color: beige">
                    <h3 style="color : green; font-weight: bold; font-size: 14px; text-transform: uppercase;">PASSWORD RESET MAIL</h3>
                    <p>Dear ${firstName} ${lastName},</p>
                    <p>To Verify your password reset request, please click on the button below</p>
                    <a style="background-color: green; color: white; border-radius: 10px; padding: 10px; width: 150px; text-decoration: none;" href="${clientUrl}">Reset My Password</a>
                    <p>If you are having troubles with the button above click the link below</p>
                    <a style="color: green; text-decoration: none;" href="${clientUrl}">${clientUrl}</a>
                </div>
            </body>
        </html>
    `)
}

module.exports = {welcomeMail, resetMail}