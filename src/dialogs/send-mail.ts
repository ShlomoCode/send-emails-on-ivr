const sendMail = require('../servises/sendMail');
const { validate: emailValidator } = require('deep-email-validator');

module.exports = async (call) => {
    const emailM = { type: 'text', data: 'שלום! יש להקליד את כתובת האימייל שאליה אתה רוצה לשלוח את ההודעה' };
    const email = await call.read([emailM], 'tap', { play_ok_mode: 'EmailKeyboard' });
    console.log('email:', email);

    const validateEmail = await emailValidator({
        email,
        validateRegex: true,
        validateMx: true,
        validateTypo: false,
        validateDisposable: false,
        validateSMTP: false
    });

    if (!validateEmail.valid) {
        console.log('email is not valid');
        await call.id_list_message([{ type: 'text', data: 'כתובת המייל אינה תקינה, נסה שוב' }], true);
        return await call.restart_ext();
    }

    const subjectM = { type: 'text', data: 'יש להקיש את נושא ההודעה שברצונך לשלוח' };
    const subject = await call.read([subjectM], 'tap', { play_ok_mode: 'HebrewKeyboard' });
    console.log('subject:', subject);

    const bodyM = { type: 'text', data: 'יש להקליד את תוכן ההודעה שברצונך לשלוח' };
    const body = await call.read([bodyM], 'tap', { play_ok_mode: 'HebrewKeyboard' });
    console.log('body:', body);

    const confirm = await call.read(
        [
            { type: 'text', data: 'ההודעה שנקלטה היא:' },
            { type: 'text', data: `נושא: ${subject.replace(/[.\-"'&|]/g, '')}` },
            { type: 'text', data: `תוכן ההודעה: ${body.replace(/[.\-"'&|]/g, '')}` },
            { type: 'text', data: 'האם אתה מעוניין לשלוח את ההודעה? לאישור הקש אחת, לביטול הקש 2' }
        ]
        , 'tap', { digits_allowed: [1, 2], max: 1 });

    if (confirm === '2') {
        console.log('message rejected by user!');
        const rejectedMessage = [
            { type: 'text', data: 'השליחה בוטלה בהצלחה' },
            { type: 'text', data: 'הנך מועבר לשלוח הראשית' }
        ];
        await call.id_list_message(rejectedMessage, true);
        return await call.go_to_folder('/');
    } else {
        try {
            const emailSent = await sendMail(email, subject, body);
            console.log(emailSent.response);
            await call.id_list_message([{
                type: 'text',
                data: 'ההודעה נשלחה בהצלחה! שלום ולהתראות'
            }], true);
        } catch (error) {
            console.log(error);
            await call.id_list_message([
                { type: 'text', data: 'חלה שגיאה בשליחת ההודעה' },
                { type: 'text', data: 'נסה שוב במועד מאוחר יותר' },
                { type: 'text', data: 'שלום ולהתראות' }
            ], true);
        }
        return await call.go_to_folder('hangup');
    }
};
