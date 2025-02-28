import { DEFAULT_CONFIG } from "@goauthentik/common/api/config";
import { docLink } from "@goauthentik/common/global";
import { groupBy } from "@goauthentik/common/utils";
import "@goauthentik/elements/CodeMirror";
import "@goauthentik/elements/forms/HorizontalFormElement";
import { ModelForm } from "@goauthentik/elements/forms/ModelForm";
import "@goauthentik/elements/forms/SearchSelect";
import YAML from "yaml";

import { t } from "@lingui/macro";

import { TemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { until } from "lit/directives/until.js";

import {
    Outpost,
    OutpostTypeEnum,
    OutpostsApi,
    OutpostsServiceConnectionsAllListRequest,
    ProvidersApi,
    ServiceConnection,
} from "@goauthentik/api";

@customElement("ak-outpost-form")
export class OutpostForm extends ModelForm<Outpost, string> {
    @property()
    type: OutpostTypeEnum = OutpostTypeEnum.Proxy;

    @property({ type: Boolean })
    embedded = false;

    async loadInstance(pk: string): Promise<Outpost> {
        const o = await new OutpostsApi(DEFAULT_CONFIG).outpostsInstancesRetrieve({
            uuid: pk,
        });
        this.type = o.type || OutpostTypeEnum.Proxy;
        return o;
    }

    getSuccessMessage(): string {
        if (this.instance) {
            return t`Successfully updated outpost.`;
        } else {
            return t`Successfully created outpost.`;
        }
    }

    send = (data: Outpost): Promise<Outpost> => {
        if (this.instance) {
            return new OutpostsApi(DEFAULT_CONFIG).outpostsInstancesUpdate({
                uuid: this.instance.pk || "",
                outpostRequest: data,
            });
        } else {
            return new OutpostsApi(DEFAULT_CONFIG).outpostsInstancesCreate({
                outpostRequest: data,
            });
        }
    };

    renderProviders(): Promise<TemplateResult[]> {
        switch (this.type) {
            case OutpostTypeEnum.Proxy:
                return new ProvidersApi(DEFAULT_CONFIG)
                    .providersProxyList({
                        ordering: "name",
                        applicationIsnull: false,
                    })
                    .then((providers) => {
                        return providers.results.map((provider) => {
                            const selected = Array.from(this.instance?.providers || []).some(
                                (sp) => {
                                    return sp == provider.pk;
                                },
                            );
                            return html`<option
                                value=${ifDefined(provider.pk)}
                                ?selected=${selected}
                            >
                                ${provider.assignedApplicationName} (${provider.externalHost})
                            </option>`;
                        });
                    });
            case OutpostTypeEnum.Ldap:
                return new ProvidersApi(DEFAULT_CONFIG)
                    .providersLdapList({
                        ordering: "name",
                        applicationIsnull: false,
                    })
                    .then((providers) => {
                        return providers.results.map((provider) => {
                            const selected = Array.from(this.instance?.providers || []).some(
                                (sp) => {
                                    return sp == provider.pk;
                                },
                            );
                            return html`<option
                                value=${ifDefined(provider.pk)}
                                ?selected=${selected}
                            >
                                ${provider.assignedApplicationName} (${provider.name})
                            </option>`;
                        });
                    });
            case OutpostTypeEnum.Radius:
                return new ProvidersApi(DEFAULT_CONFIG)
                    .providersRadiusList({
                        ordering: "name",
                        applicationIsnull: false,
                    })
                    .then((providers) => {
                        return providers.results.map((provider) => {
                            const selected = Array.from(this.instance?.providers || []).some(
                                (sp) => {
                                    return sp == provider.pk;
                                },
                            );
                            return html`<option
                                value=${ifDefined(provider.pk)}
                                ?selected=${selected}
                            >
                                ${provider.assignedApplicationName} (${provider.name})
                            </option>`;
                        });
                    });
            case OutpostTypeEnum.UnknownDefaultOpenApi:
                return Promise.resolve([
                    html` <option value="">${t`Unknown outpost type`}</option>`,
                ]);
        }
    }

    renderForm(): TemplateResult {
        return html`<form class="pf-c-form pf-m-horizontal">
            <ak-form-element-horizontal label=${t`Name`} ?required=${true} name="name">
                <input
                    type="text"
                    value="${ifDefined(this.instance?.name)}"
                    class="pf-c-form-control"
                    required
                />
            </ak-form-element-horizontal>
            <ak-form-element-horizontal label=${t`Type`} ?required=${true} name="type">
                <select
                    class="pf-c-form-control"
                    @change=${(ev: Event) => {
                        const target = ev.target as HTMLSelectElement;
                        this.type = target.selectedOptions[0].value as OutpostTypeEnum;
                    }}
                >
                    <option
                        value=${OutpostTypeEnum.Proxy}
                        ?selected=${this.instance?.type === OutpostTypeEnum.Proxy}
                    >
                        ${t`Proxy`}
                    </option>
                    <option
                        value=${OutpostTypeEnum.Ldap}
                        ?selected=${this.instance?.type === OutpostTypeEnum.Ldap}
                    >
                        ${t`LDAP`}
                    </option>
                </select>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal label=${t`Integration`} name="serviceConnection">
                <ak-search-select
                    .fetchObjects=${async (query?: string): Promise<ServiceConnection[]> => {
                        const args: OutpostsServiceConnectionsAllListRequest = {
                            ordering: "name",
                        };
                        if (query !== undefined) {
                            args.search = query;
                        }
                        const items = await new OutpostsApi(
                            DEFAULT_CONFIG,
                        ).outpostsServiceConnectionsAllList(args);
                        return items.results;
                    }}
                    .renderElement=${(item: ServiceConnection): string => {
                        return item.name;
                    }}
                    .value=${(item: ServiceConnection | undefined): string | undefined => {
                        return item?.pk;
                    }}
                    .groupBy=${(items: ServiceConnection[]) => {
                        return groupBy(items, (item) => item.verboseName);
                    }}
                    .selected=${(item: ServiceConnection, items: ServiceConnection[]): boolean => {
                        let selected = this.instance?.serviceConnection === item.pk;
                        if (items.length === 1 && !this.instance) {
                            selected = true;
                        }
                        return selected;
                    }}
                    ?blankable=${true}
                >
                </ak-search-select>
                <p class="pf-c-form__helper-text">
                    ${t`Selecting an integration enables the management of the outpost by authentik.`}
                </p>
                <p class="pf-c-form__helper-text">
                    See
                    <a target="_blank" href="${docLink("/docs/outposts?utm_source=authentik")}"
                        >documentation</a
                    >.
                </p>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal
                label=${t`Applications`}
                ?required=${!this.embedded}
                name="providers"
            >
                <select class="pf-c-form-control" multiple>
                    ${until(this.renderProviders(), html`<option>${t`Loading...`}</option>`)}
                </select>
                <p class="pf-c-form__helper-text">
                    ${t`You can only select providers that match the type of the outpost.`}
                </p>
                <p class="pf-c-form__helper-text">
                    ${t`Hold control/command to select multiple items.`}
                </p>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal label=${t`Configuration`} name="config">
                <!-- @ts-ignore -->
                <ak-codemirror
                    mode="yaml"
                    value="${until(
                        new OutpostsApi(DEFAULT_CONFIG)
                            .outpostsInstancesDefaultSettingsRetrieve()
                            .then((config) => {
                                let fc = config.config;
                                if (this.instance) {
                                    fc = this.instance.config;
                                }
                                return YAML.stringify(fc);
                            }),
                    )}"
                ></ak-codemirror>
                <p class="pf-c-form__helper-text">
                    ${t`Set custom attributes using YAML or JSON.`}
                </p>
                <p class="pf-c-form__helper-text">
                    ${t`See more here:`}&nbsp;
                    <a
                        target="_blank"
                        href="${docLink("/docs/outposts?utm_source=authentik#configuration")}"
                        >${t`Documentation`}</a
                    >
                </p>
            </ak-form-element-horizontal>
        </form>`;
    }
}
