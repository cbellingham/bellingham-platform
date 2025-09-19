class SignaturePad {
  constructor() {
    this._empty = false;
  }

  clear() {
    this._empty = true;
  }

  isEmpty() {
    return this._empty;
  }

  toDataURL() {
    this._empty = false;
    return 'data:image/png;base64,mock-signature';
  }

  off() {}
}

export default SignaturePad;
