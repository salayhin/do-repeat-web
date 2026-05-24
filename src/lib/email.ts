import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

export async function sendReminderEmail(
  to: string,
  habits: { name: string; icon: string }[]
) {
  await getResend().emails.send({
    from: 'Do Repeat <reminders@dorepeat.app>',
    to,
    subject: `Your habits for today`,
    html: `<p>Time to check in on your habits:</p><ul>${habits
      .map((h) => `<li>${h.icon} ${h.name}</li>`)
      .join('')}</ul>`,
  })
}
