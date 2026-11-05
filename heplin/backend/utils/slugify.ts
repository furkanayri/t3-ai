import _slugify from 'slugify';

export default function slugify(str: string) {
    return _slugify(str, {
        lower: true,
        trim: true,
        remove: /[*+~.()'"!:@]/g,
    })
}