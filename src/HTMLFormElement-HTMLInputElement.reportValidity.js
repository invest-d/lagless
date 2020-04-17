/* Copyright (c) 2016 Tobias Buschor https://goo.gl/gl0mbf | MIT License https://goo.gl/HgajeK */
export function defineReportValidityPolyfill() {
    if (!HTMLFormElement.prototype.reportValidity) {
        HTMLFormElement.prototype.reportValidity = function() {
            if (this.checkValidity()) return true;
            var btn = document.createElement('button');
            this.appendChild(btn);
            btn.click();
            this.removeChild(btn);
            return false;
        };
    }

    if (!HTMLInputElement.prototype.reportValidity) {
        HTMLInputElement.prototype.reportValidity = function(){
            if (this.checkValidity()) return true;
            var tmpForm;
            if (!this.form) {
                tmpForm = document.createElement('form');
                tmpForm.style.display = 'inline';
                this.before(tmpForm);
                tmpForm.append(this);
            }
            var siblings = Array.from(this.form.elements).filter(function(input){
                return input !== this && !!input.checkValidity && !input.disabled;
            },this);
            siblings.forEach(function(input){
                input.disabled = true;
            });
            this.form.reportValidity();
            siblings.forEach(function(input){
                input.disabled = false;
            });
            if (tmpForm) {
                tmpForm.before(this);
                tmpForm.remove();
            }
            this.focus();
            this.selectionStart = 0;
            return false;
        };
    }
}
