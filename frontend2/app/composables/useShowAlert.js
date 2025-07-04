export default function () {
    // where the state of an alert is stored. This state survives between pages (because it uses "useState")
    // see https://nuxt.com/docs/api/composables/use-state
    // - message: the text of the message to display
    // - colour: any HTML colour code, or. Vuetify colour shortcut e.g. 'secondary'
    // - show : boolean that decides whether the alert is shown or not
    const alert = useState('alert',  () => { return { message: '', show: false, colour: 'primary' } })
  
    // function called to show an alert. It modifies the 'alert' state, which is picked up by the component
    // that only renders when 'show' is true. A timeout is used to set show back to false after 2s.
    function showAlert(message, colour='primary') {
      if (message) {
        alert.value.message = message
        alert.value.colour = colour
        alert.value.show = true
        setTimeout(() => {
          alert.value.show = false
        }, 5000)
      }
    }
  
    // return the alert state and the showAlert function
    return { alert, showAlert }
  }