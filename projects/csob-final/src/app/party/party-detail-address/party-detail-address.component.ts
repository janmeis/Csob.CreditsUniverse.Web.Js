import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { TranslationService } from '../../services/translation-service';
import { IPartyAddressDto } from '../../services/webapi/webapi-models';

@Component({
    selector: 'app-party-detail-address',
    templateUrl: './party-detail-address.component.html',
    styleUrls: ['./party-detail-address.component.less']
})
export class PartyDetailAddressComponent {
    @Input() readonly = false;
    @Input() required = false;
    private _address: IPartyAddressDto;
    get address(): IPartyAddressDto {
        return this._address;
    }
    @Input() set address(x: IPartyAddressDto) {
        this._address = x;
        this.addressChange.emit(this._address);
    }
    @Output() addressChange = new EventEmitter<IPartyAddressDto>();
    isAddressRequired = false;

    addressValueChange(value: string) {
        setTimeout(() => {
            this.isAddressRequired = this.address.Village != null && this.address.Village.length > 0
                || this.address.Street != null && this.address.Street.length > 0
                || this.address.DescriptiveNumber != null && this.address.DescriptiveNumber.length > 0
                || this.address.Zip != null && this.address.Zip.length > 0;
        }, 0);
    }
}
