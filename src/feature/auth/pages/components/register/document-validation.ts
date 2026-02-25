const onlyDigits = (value: string) => value.replace(/\D/g, "");

const hasAllEqualDigits = (value: string) => /^(\d)\1+$/.test(value);

const calculateCpfDigit = (base: string, factor: number) => {
    let total = 0;

    for (const char of base) {
        total += Number(char) * factor;
        factor -= 1;
    }

    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
};

const calculateCnpjDigit = (base: string, factors: number[]) => {
    const total = base
        .split("")
        .reduce((acc, digit, index) => acc + Number(digit) * factors[index], 0);

    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
};

export const isValidCpf = (value: string) => {
    const cpf = onlyDigits(value);

    if (cpf.length !== 11 || hasAllEqualDigits(cpf)) {
        return false;
    }

    const firstDigit = calculateCpfDigit(cpf.slice(0, 9), 10);
    const secondDigit = calculateCpfDigit(cpf.slice(0, 10), 11);

    return cpf.endsWith(`${firstDigit}${secondDigit}`);
};

export const isValidCnpj = (value: string) => {
    const cnpj = onlyDigits(value);

    if (cnpj.length !== 14 || hasAllEqualDigits(cnpj)) {
        return false;
    }

    const firstDigit = calculateCnpjDigit(cnpj.slice(0, 12), [
        5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
    ]);
    const secondDigit = calculateCnpjDigit(cnpj.slice(0, 13), [
        6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
    ]);

    return cnpj.endsWith(`${firstDigit}${secondDigit}`);
};

export const isValidCpfOrCnpj = (value: string) => {
    const document = onlyDigits(value);

    if (document.length === 11) {
        return isValidCpf(document);
    }

    if (document.length === 14) {
        return isValidCnpj(document);
    }

    return false;
};

export const normalizeDocument = (value: string) => onlyDigits(value);