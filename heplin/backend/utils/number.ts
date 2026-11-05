export default function number(num: any) {
    return !isNaN(+num) ? +num : 0;
}