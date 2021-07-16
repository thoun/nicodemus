function slideToObjectAndAttach(game: NicodemusGame, object: HTMLElement, destinationId: string, posX?: number, posY?: number): Promise<boolean> {
    const destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return Promise.resolve(true);
    }

    return new Promise(resolve => {
        const originalZIndex = Number(object.style.zIndex);
        object.style.zIndex = '10';

        const objectCR = object.getBoundingClientRect();
        const destinationCR = destination.getBoundingClientRect();

        const deltaX = destinationCR.left - objectCR.left + (posX ?? 0) * game.getZoom();
        const deltaY = destinationCR.top - objectCR.top + (posY ?? 0) * game.getZoom();

        //object.id == 'tile98' && console.log(object, destination, objectCR, destinationCR, destinationCR.left - objectCR.left, );

        object.style.transition = `transform 0.5s ease-in`;
        object.style.transform = `translate(${deltaX / game.getZoom()}px, ${deltaY / game.getZoom()}px)`;

        const transitionend = () => {
            console.log('ontransitionend', object, destination);
            object.style.top = posY !== undefined ? `${posY}px` : 'unset';
            object.style.left = posX !== undefined ? `${posX}px` : 'unset';
            object.style.position = (posX !== undefined || posY !== undefined) ? 'absolute' : 'relative';
            object.style.zIndex = originalZIndex ? ''+originalZIndex : 'unset';
            object.style.transform = 'unset';
            object.style.transition = 'unset';
            destination.appendChild(object);

            object.removeEventListener('transitionend', transitionend);

            resolve(true);
        };

        object.addEventListener('transitionend', transitionend);
    });
}